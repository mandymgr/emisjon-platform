import prisma from '../config/database';
import { Order, OrderType, OrderStatus, Prisma } from '@prisma/client';
import { matchingService } from './matchingService';
import { notificationService } from './notificationService';
import { tradingAuditService } from './tradingAuditService';

interface CreateOrderData {
  shareholderId: string;
  type: OrderType;
  quantity: number;
  price: number;
  userId: string;
}

class TradingService {
  async createOrder(data: CreateOrderData): Promise<Order | any> {
    const { shareholderId, type, quantity, price, userId } = data;

    return await prisma.$transaction(async (tx) => {
      const shareholder = await tx.shareholder.findUnique({
        where: { id: shareholderId },
        select: {
          id: true,
          name: true,
          sharesOwned: true,
          sharesAvailable: true,
          sharesLockedForOrders: true,
          userId: true,
        },
      });

      if (!shareholder) {
        throw new Error('Shareholder not found');
      }

      if (shareholder.userId !== userId) {
        throw new Error('Unauthorized: You can only create orders for your own shares');
      }

      if (type === OrderType.SELL) {
        if (shareholder.sharesAvailable < quantity) {
          throw new Error(`Insufficient available shares. Available: ${shareholder.sharesAvailable}, Requested: ${quantity}`);
        }

        await tx.shareholder.update({
          where: { id: shareholderId },
          data: {
            sharesAvailable: shareholder.sharesAvailable - quantity,
            sharesLockedForOrders: shareholder.sharesLockedForOrders + quantity,
          } as any,
        });
      }

      const order = await tx.order.create({
        data: {
          shareholderId,
          userId,
          createdBy: userId,
          type,
          quantity,
          shares: quantity,
          remainingQuantity: quantity,
          filledQuantity: 0,
          price,
          pricePerShare: price,
          status: OrderStatus.OPEN,
        } as any,
      });

      await tradingAuditService.logOrderCreation(tx as any, order, userId);

      await notificationService.createOrderNotification(tx as any, order, userId);

      process.nextTick(() => {
        matchingService.processOrder(order).catch(console.error);
      });

      return order as any;
    });
  }

  async cancelOrder(orderId: string, userId: string, userRole: string): Promise<Order | any> {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== OrderStatus.OPEN && order.status !== OrderStatus.PARTIAL) {
        throw new Error('Only open or partially filled orders can be cancelled');
      }

      const isOwner = order.userId === userId;
      const isAdmin = userRole === 'ADMIN';

      if (!isOwner && !isAdmin) {
        throw new Error('Unauthorized: You can only cancel your own orders');
      }

      if (order.type === OrderType.SELL && (order as any).remainingQuantity > 0) {
        await tx.shareholder.update({
          where: { id: (order as any).shareholderId },
          data: {
            sharesAvailable: {
              increment: (order as any).remainingQuantity,
            },
            sharesLockedForOrders: {
              decrement: (order as any).remainingQuantity,
            },
          } as any,
        });
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          remainingQuantity: 0,
          updatedAt: new Date(),
        } as any,
      });

      await tradingAuditService.logOrderCancellation(tx as any, updatedOrder, userId);

      await notificationService.createOrderCancellationNotification(tx as any, updatedOrder, userId);

      return updatedOrder as any;
    });
  }

  async getOrderById(orderId: string, userId: string, userRole: string): Promise<Order | any | null> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyTrades: {
          select: {
            id: true,
            sharesTraded: true,
            pricePerShare: true,
            status: true,
          },
        },
        sellTrades: {
          select: {
            id: true,
            sharesTraded: true,
            pricePerShare: true,
            status: true,
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    const isOwner = order.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new Error('Unauthorized: You can only view your own orders');
    }

    const trades = [...((order as any).buyTrades || []), ...((order as any).sellTrades || [])];

    return {
      ...order,
      trades,
    };
  }

  async getUserOrders(
    userId: string,
    filters?: {
      status?: OrderStatus;
      type?: OrderType;
      shareholderId?: string;
      fromDate?: Date;
      toDate?: Date;
    }
  ): Promise<(Order | any)[]> {
    const where: Prisma.OrderWhereInput = {
      userId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.shareholderId && { shareholderId: filters.shareholderId }),
      ...(filters?.fromDate && {
        createdAt: {
          gte: filters.fromDate,
          ...(filters?.toDate && { lte: filters.toDate }),
        },
      }),
    };

    const orders = await prisma.order.findMany({
      where,
      include: {
        buyTrades: {
          select: {
            id: true,
            sharesTraded: true,
            pricePerShare: true,
            status: true,
          },
        },
        sellTrades: {
          select: {
            id: true,
            sharesTraded: true,
            pricePerShare: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => ({
      ...order,
      trades: [...((order as any).buyTrades || []), ...((order as any).sellTrades || [])],
    }));
  }

  async getMarketOrders(
    filters?: {
      status?: OrderStatus;
      type?: OrderType;
      minPrice?: number;
      maxPrice?: number;
    }
  ): Promise<(Order | any)[]> {
    const where: Prisma.OrderWhereInput = {
      status: filters?.status || OrderStatus.OPEN,
      ...(filters?.type && { type: filters.type }),
      ...(filters?.minPrice && {
        pricePerShare: {
          gte: filters.minPrice,
          ...(filters?.maxPrice && { lte: filters.maxPrice }),
        },
      }),
    };

    const orders = await prisma.order.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { pricePerShare: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return orders;
  }

  async getOrderBook(): Promise<{
    buyOrders: (Order | any)[];
    sellOrders: (Order | any)[];
    spread: number | null;
  }> {
    const [buyOrders, sellOrders] = await Promise.all([
      this.getMarketOrders({ type: OrderType.BUY, status: OrderStatus.OPEN }),
      this.getMarketOrders({ type: OrderType.SELL, status: OrderStatus.OPEN }),
    ]);

    const highestBuy = buyOrders.length > 0 ? Math.max(...buyOrders.map(o => Number((o as any).price || o.pricePerShare))) : null;
    const lowestSell = sellOrders.length > 0 ? Math.min(...sellOrders.map(o => Number((o as any).price || o.pricePerShare))) : null;
    
    const spread = highestBuy && lowestSell ? lowestSell - highestBuy : null;

    return {
      buyOrders: buyOrders.sort((a, b) => Number((b as any).price || b.pricePerShare) - Number((a as any).price || a.pricePerShare)),
      sellOrders: sellOrders.sort((a, b) => Number((a as any).price || a.pricePerShare) - Number((b as any).price || b.pricePerShare)),
      spread,
    };
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    remainingQuantity?: number
  ): Promise<Order> {
    return await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(remainingQuantity !== undefined && { remainingQuantity }),
      } as any,
    });
  }

  async expireOldOrders(): Promise<number> {
    try {
      // Find all orders that have a timeLimit and it has passed
      const expiredOrders = await prisma.order.findMany({
        where: {
          timeLimit: {
            not: null,
            lt: new Date(), // Less than current time
          },
          status: {
            in: [OrderStatus.OPEN, OrderStatus.PARTIAL],
          },
        },
        include: {
          shareholder: true,
        },
      });

      if (expiredOrders.length === 0) {
        return 0;
      }

      console.log(`Found ${expiredOrders.length} expired orders to process`);

      // Process each expired order
      for (const order of expiredOrders) {
        await prisma.$transaction(async (tx) => {
          // Update order status to EXPIRED
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.EXPIRED,
              updatedAt: new Date(),
            } as any,
          });

          // If it's a SELL order, unlock the shares
          if (order.type === OrderType.SELL && (order as any).remainingQuantity > 0) {
            await tx.shareholder.update({
              where: { id: (order as any).shareholderId },
              data: {
                sharesAvailable: {
                  increment: (order as any).remainingQuantity,
                },
                sharesLockedForOrders: {
                  decrement: (order as any).remainingQuantity,
                },
              } as any,
            });
          }

          // Log the expiration in audit log (using order.userId as the affected user)
          await tradingAuditService.logOrderExpiration(tx as any, order, order.userId);

          // Create notification for the user
          await notificationService.createOrderExpirationNotification(
            tx as any,
            order,
            order.userId
          );
        });
      }

      console.log(`Successfully expired ${expiredOrders.length} orders`);
      return expiredOrders.length;
    } catch (error) {
      console.error('Error expiring old orders:', error);
      return 0;
    }
  }
}

export const tradingService = new TradingService();