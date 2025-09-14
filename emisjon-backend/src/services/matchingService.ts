import prisma from '../config/database';
import { Order, Trade, OrderType, OrderStatus, TradeStatus } from '@prisma/client';
import { notificationService } from './notificationService';
import { tradingAuditService } from './tradingAuditService';
import { ExtendedOrder, toExtendedOrder } from '../types/trading';

interface MatchResult {
  trade: Trade;
  buyOrderUpdate: { id: string; remainingQuantity: number; status: OrderStatus };
  sellOrderUpdate: { id: string; remainingQuantity: number; status: OrderStatus };
}

class MatchingService {
  private isProcessing = false;
  private orderQueue: ExtendedOrder[] = [];

  async processOrder(order: Order): Promise<void> {
    const extendedOrder = toExtendedOrder(order);
    this.orderQueue.push(extendedOrder);
    
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.orderQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.orderQueue.length > 0) {
        const order = this.orderQueue.shift()!;
        await this.matchOrder(order);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async matchOrder(order: ExtendedOrder): Promise<void> {
    if (order.type === OrderType.BUY) {
      await this.matchBuyOrder(order);
    } else {
      await this.matchSellOrder(order);
    }
  }

  private async matchBuyOrder(buyOrder: ExtendedOrder): Promise<void> {
    const matchingSellOrders = await prisma.order.findMany({
      where: {
        type: OrderType.SELL,
        status: {
          in: [OrderStatus.OPEN, OrderStatus.PARTIAL],
        },
        pricePerShare: {
          lte: buyOrder.price || buyOrder.pricePerShare,
        },
      },
      orderBy: [
        { pricePerShare: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    for (const sellOrder of matchingSellOrders) {
      const extSellOrder = toExtendedOrder(sellOrder);
      if (!buyOrder.remainingQuantity || buyOrder.remainingQuantity <= 0) break;

      const matchResult = await this.executeTrade(buyOrder, extSellOrder);
      
      if (matchResult) {
        buyOrder.remainingQuantity = matchResult.buyOrderUpdate.remainingQuantity;
        buyOrder.status = matchResult.buyOrderUpdate.status;
      }
    }
  }

  private async matchSellOrder(sellOrder: ExtendedOrder): Promise<void> {
    const matchingBuyOrders = await prisma.order.findMany({
      where: {
        type: OrderType.BUY,
        status: {
          in: [OrderStatus.OPEN, OrderStatus.PARTIAL],
        },
        pricePerShare: {
          gte: sellOrder.price || sellOrder.pricePerShare,
        },
      },
      orderBy: [
        { pricePerShare: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    for (const buyOrder of matchingBuyOrders) {
      const extBuyOrder = toExtendedOrder(buyOrder);
      if (!sellOrder.remainingQuantity || sellOrder.remainingQuantity <= 0) break;

      const matchResult = await this.executeTrade(extBuyOrder, sellOrder);
      
      if (matchResult) {
        sellOrder.remainingQuantity = matchResult.sellOrderUpdate.remainingQuantity;
        sellOrder.status = matchResult.sellOrderUpdate.status;
      }
    }
  }

  private async executeTrade(
    buyOrder: ExtendedOrder,
    sellOrder: ExtendedOrder
  ): Promise<MatchResult | null> {
    const tradeQuantity = Math.min(buyOrder.remainingQuantity || buyOrder.shares, sellOrder.remainingQuantity || sellOrder.shares);
    
    if (tradeQuantity <= 0) {
      return null;
    }

    const executionPrice = sellOrder.createdAt < buyOrder.createdAt 
      ? Number(sellOrder.price || sellOrder.pricePerShare)
      : Number(buyOrder.price || buyOrder.pricePerShare);

    return await prisma.$transaction(async (tx) => {
      const trade = await tx.trade.create({
        data: {
          buyOrderId: buyOrder.id,
          sellOrderId: sellOrder.id,
          buyerShareholderId: buyOrder.shareholderId || '',
          sellerShareholderId: sellOrder.shareholderId || '',
          quantity: tradeQuantity,
          sharesTraded: tradeQuantity,
          price: executionPrice,
          pricePerShare: executionPrice,
          totalAmount: tradeQuantity * executionPrice,
          totalValue: tradeQuantity * executionPrice,
          status: 'PENDING_APPROVAL' as TradeStatus,
          matchedAt: new Date(),
          tradeType: tradeQuantity === (buyOrder.remainingQuantity || buyOrder.shares) || tradeQuantity === (sellOrder.remainingQuantity || sellOrder.shares) ? 'FULL' : 'PARTIAL',
        },
      });

      const buyOrderRemainingQuantity = (buyOrder.remainingQuantity || buyOrder.shares) - tradeQuantity;
      const sellOrderRemainingQuantity = (sellOrder.remainingQuantity || sellOrder.shares) - tradeQuantity;

      const buyOrderStatus = buyOrderRemainingQuantity === 0 
        ? OrderStatus.FILLED 
        : OrderStatus.PARTIAL;
      
      const sellOrderStatus = sellOrderRemainingQuantity === 0 
        ? OrderStatus.FILLED 
        : OrderStatus.PARTIAL;

      await tx.order.update({
        where: { id: buyOrder.id },
        data: {
          remainingQuantity: buyOrderRemainingQuantity,
          status: buyOrderStatus,
          filledQuantity: {
            increment: tradeQuantity,
          },
        } as any,
      });

      await tx.order.update({
        where: { id: sellOrder.id },
        data: {
          remainingQuantity: sellOrderRemainingQuantity,
          status: sellOrderStatus,
          filledQuantity: {
            increment: tradeQuantity,
          },
        } as any,
      });

      await tradingAuditService.logTradeExecution(tx, trade, 'SYSTEM');

      await notificationService.createTradeNotification(tx, trade);

      const [buyerUser, sellerUser] = await Promise.all([
        buyOrder.shareholderId ? tx.shareholder.findUnique({
          where: { id: buyOrder.shareholderId },
          select: { userId: true },
        }) : null,
        sellOrder.shareholderId ? tx.shareholder.findUnique({
          where: { id: sellOrder.shareholderId },
          select: { userId: true },
        }) : null,
      ]);

      if (buyerUser?.userId) {
        await notificationService.notifyUser(
          tx,
          buyerUser.userId,
          'SYSTEM_ALERT' as any,
          `Your buy order has been partially matched. ${tradeQuantity} shares at ${executionPrice} NOK`,
          { tradeId: trade.id, orderId: buyOrder.id }
        );
      }

      if (sellerUser?.userId) {
        await notificationService.notifyUser(
          tx,
          sellerUser.userId,
          'SYSTEM_ALERT' as any,
          `Your sell order has been partially matched. ${tradeQuantity} shares at ${executionPrice} NOK`,
          { tradeId: trade.id, orderId: sellOrder.id }
        );
      }

      const admins = await tx.user.findMany({
        where: { 
          role: 'ADMIN',
          level: { gte: 2 },
        },
        select: { id: true },
      });

      for (const admin of admins) {
        await notificationService.notifyUser(
          tx,
          admin.id,
          'SYSTEM_ALERT' as any,
          `New trade pending approval: ${tradeQuantity} shares at ${executionPrice} NOK`,
          { tradeId: trade.id }
        );
      }

      return {
        trade,
        buyOrderUpdate: {
          id: buyOrder.id,
          remainingQuantity: buyOrderRemainingQuantity,
          status: buyOrderStatus,
        },
        sellOrderUpdate: {
          id: sellOrder.id,
          remainingQuantity: sellOrderRemainingQuantity,
          status: sellOrderStatus,
        },
      };
    });
  }

  async getMatchingOrders(orderId: string): Promise<Order[]> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.status !== OrderStatus.OPEN) {
      return [];
    }

    if (order.type === OrderType.BUY) {
      return await prisma.order.findMany({
        where: {
          type: OrderType.SELL,
          status: OrderStatus.OPEN,
          pricePerShare: {
            lte: order.pricePerShare,
          },
        },
        orderBy: [
          { pricePerShare: 'asc' },
          { createdAt: 'asc' },
        ],
      });
    } else {
      return await prisma.order.findMany({
        where: {
          type: OrderType.BUY,
          status: OrderStatus.OPEN,
          pricePerShare: {
            gte: order.pricePerShare,
          },
        },
        orderBy: [
          { pricePerShare: 'desc' },
          { createdAt: 'asc' },
        ],
      });
    }
  }

  async calculateBestPrice(type: OrderType): Promise<number | null> {
    if (type === OrderType.BUY) {
      const bestSellOrder = await prisma.order.findFirst({
        where: {
          type: OrderType.SELL,
          status: OrderStatus.OPEN,
        },
        orderBy: { pricePerShare: 'asc' },
      });
      return bestSellOrder?.pricePerShare ? Number(bestSellOrder.pricePerShare) : null;
    } else {
      const bestBuyOrder = await prisma.order.findFirst({
        where: {
          type: OrderType.BUY,
          status: OrderStatus.OPEN,
        },
        orderBy: { pricePerShare: 'desc' },
      });
      return bestBuyOrder?.pricePerShare ? Number(bestBuyOrder.pricePerShare) : null;
    }
  }

  async getMarketDepth(levels: number = 5): Promise<{
    bids: Array<{ price: number; quantity: number; orders: number }>;
    asks: Array<{ price: number; quantity: number; orders: number }>;
  }> {
    const [buyOrders, sellOrders] = await Promise.all([
      prisma.order.groupBy({
        by: ['pricePerShare'],
        where: {
          type: OrderType.BUY,
          status: {
            in: [OrderStatus.OPEN, OrderStatus.PARTIAL],
          },
        },
        _sum: {
          shares: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          pricePerShare: 'desc',
        },
        take: levels,
      }),
      prisma.order.groupBy({
        by: ['pricePerShare'],
        where: {
          type: OrderType.SELL,
          status: {
            in: [OrderStatus.OPEN, OrderStatus.PARTIAL],
          },
        },
        _sum: {
          shares: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          pricePerShare: 'asc',
        },
        take: levels,
      }),
    ]);

    return {
      bids: buyOrders.map(group => ({
        price: Number(group.pricePerShare),
        quantity: group._sum?.shares || 0,
        orders: (group._count as any)?.id || 0,
      })),
      asks: sellOrders.map(group => ({
        price: Number(group.pricePerShare),
        quantity: group._sum?.shares || 0,
        orders: (group._count as any)?.id || 0,
      })),
    };
  }
}

export const matchingService = new MatchingService();