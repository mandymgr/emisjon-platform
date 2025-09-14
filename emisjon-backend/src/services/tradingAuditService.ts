import { Prisma, TradingActionType, Order, Trade, TradeStatus } from '@prisma/client';

class TradingAuditService {
  async logOrderCreation(
    tx: Prisma.TransactionClient,
    order: Order,
    userId: string
  ): Promise<void> {
    await tx.tradingAuditLog.create({
      data: {
        action: TradingActionType.ORDER_CREATED,
        entityType: 'ORDER',
        entityId: order.id,
        userId,
        oldValues: {
          orderId: order.id,
          shareholderId: (order as any).shareholderId,
          type: order.type,
          quantity: (order as any).quantity || order.shares,
          price: (order as any).price || order.pricePerShare,
          status: order.status,
        },
        metadata: {
          ip: (global as any).requestIp || 'system',
          userAgent: (global as any).userAgent || 'system',
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  async logOrderCancellation(
    tx: Prisma.TransactionClient,
    order: Order,
    userId: string
  ): Promise<void> {
    await tx.tradingAuditLog.create({
      data: {
        action: TradingActionType.ORDER_CANCELLED,
        entityType: 'ORDER',
        entityId: order.id,
        userId,
        oldValues: {
          orderId: order.id,
          shareholderId: (order as any).shareholderId,
          type: order.type,
          quantity: (order as any).quantity || order.shares,
          remainingQuantity: (order as any).remainingQuantity,
          price: (order as any).price || order.pricePerShare,
          status: order.status,
        },
        metadata: {
          ip: (global as any).requestIp || 'system',
          userAgent: (global as any).userAgent || 'system',
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  async logOrderModification(
    tx: Prisma.TransactionClient,
    order: Order,
    userId: string,
    changes: Record<string, any>
  ): Promise<void> {
    await tx.tradingAuditLog.create({
      data: {
        action: TradingActionType.ORDER_CANCELLED,
        entityType: 'ORDER',
        entityId: order.id,
        userId,
        oldValues: {
          orderId: order.id,
          changes,
          newValues: {
            quantity: (order as any).quantity || order.shares,
            price: (order as any).price || order.pricePerShare,
            status: order.status,
          },
        },
        metadata: {
          ip: (global as any).requestIp || 'system',
          userAgent: (global as any).userAgent || 'system',
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  async logTradeExecution(
    tx: Prisma.TransactionClient,
    trade: Trade,
    userId: string
  ): Promise<void> {
    await tx.tradingAuditLog.create({
      data: {
        action: TradingActionType.TRADE_CREATED,
        entityType: 'TRADE',
        entityId: trade.id,
        userId,
        oldValues: {
          tradeId: trade.id,
          buyOrderId: trade.buyOrderId,
          sellOrderId: trade.sellOrderId,
          buyerShareholderId: (trade as any).buyerShareholderId,
          sellerShareholderId: (trade as any).sellerShareholderId,
          quantity: (trade as any).quantity || trade.sharesTraded,
          price: (trade as any).price || trade.pricePerShare,
          totalAmount: (trade as any).totalAmount || trade.totalValue,
          status: trade.status,
        },
        metadata: {
          ip: 'system',
          userAgent: 'matching-engine',
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  async logTradeApproval(
    tx: Prisma.TransactionClient,
    trade: Trade,
    userId: string,
    approved: boolean,
    notes?: string
  ): Promise<void> {
    const action = approved 
      ? TradingActionType.TRADE_APPROVED 
      : TradingActionType.TRADE_REJECTED;

    await tx.tradingAuditLog.create({
      data: {
        action,
        entityType: 'TRADE',
        entityId: trade.id,
        userId,
        oldValues: {
          tradeId: trade.id,
          approved,
          notes,
          quantity: (trade as any).quantity || trade.sharesTraded,
          price: (trade as any).price || trade.pricePerShare,
          totalAmount: (trade as any).totalAmount || trade.totalValue,
          previousStatus: trade.status,
          newStatus: approved ? TradeStatus.COMPLETED : TradeStatus.REJECTED,
        },
        metadata: {
          ip: (global as any).requestIp || 'system',
          userAgent: (global as any).userAgent || 'system',
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  async logTradeCancellation(
    tx: Prisma.TransactionClient,
    trade: Trade,
    userId: string,
    reason: string
  ): Promise<void> {
    await tx.tradingAuditLog.create({
      data: {
        action: TradingActionType.TRADE_REJECTED,
        entityType: 'TRADE',
        entityId: trade.id,
        userId,
        oldValues: {
          tradeId: trade.id,
          reason,
          quantity: (trade as any).quantity || trade.sharesTraded,
          price: (trade as any).price || trade.pricePerShare,
          totalAmount: (trade as any).totalAmount || trade.totalValue,
          status: trade.status,
        },
        metadata: {
          ip: (global as any).requestIp || 'system',
          userAgent: (global as any).userAgent || 'system',
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  async logOrderExpiration(
    tx: Prisma.TransactionClient,
    order: any,
    systemUser: string
  ): Promise<void> {
    await tx.tradingAuditLog.create({
      data: {
        userId: systemUser,
        action: TradingActionType.ORDER_EXPIRED,
        entityType: 'Order',
        entityId: order.id,
        oldValues: {
          status: order.status,
          remainingQuantity: order.remainingQuantity,
        },
        newValues: {
          status: 'EXPIRED',
          remainingQuantity: 0,
        },
        metadata: {
          timeLimit: order.timeLimit,
          expiredAt: new Date().toISOString(),
          systemAction: true,
        },
      },
    });
  }

  async logShareTransfer(
    tx: Prisma.TransactionClient,
    fromShareholderId: string,
    toShareholderId: string,
    quantity: number,
    userId: string,
    tradeId?: string
  ): Promise<void> {
    await tx.tradingAuditLog.create({
      data: {
        action: TradingActionType.SHARES_TRANSFERRED,
        entityType: 'SHAREHOLDER',
        entityId: toShareholderId,
        userId,
        oldValues: {
          fromShareholderId,
          toShareholderId,
          quantity,
          tradeId,
        },
        metadata: {
          ip: (global as any).requestIp || 'system',
          userAgent: (global as any).userAgent || 'system',
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  async logSettlement(
    tx: Prisma.TransactionClient,
    trade: Trade,
    userId: string,
    settlementDetails: Record<string, any>
  ): Promise<void> {
    await tx.tradingAuditLog.create({
      data: {
        action: TradingActionType.TRADE_APPROVED,
        entityType: 'TRADE',
        entityId: trade.id,
        userId,
        oldValues: {
          tradeId: trade.id,
          settlementDetails,
          quantity: (trade as any).quantity || trade.sharesTraded,
          price: (trade as any).price || trade.pricePerShare,
          totalAmount: (trade as any).totalAmount || trade.totalValue,
        },
        metadata: {
          ip: (global as any).requestIp || 'system',
          userAgent: (global as any).userAgent || 'system',
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  async getAuditLogs(
    filters?: {
      userId?: string;
      entityType?: string;
      entityId?: string;
      action?: TradingActionType;
      fromDate?: Date;
      toDate?: Date;
    },
    limit: number = 100
  ): Promise<any[]> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const where: Prisma.TradingAuditLogWhereInput = {
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.entityType && { entityType: filters.entityType }),
        ...(filters?.entityId && { entityId: filters.entityId }),
        ...(filters?.action && { action: filters.action }),
        ...(filters?.fromDate && {
          createdAt: {
            gte: filters.fromDate,
            ...(filters?.toDate && { lte: filters.toDate }),
          },
        }),
      };

      return await prisma.tradingAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  async getEntityHistory(
    entityType: string,
    entityId: string
  ): Promise<any[]> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      return await prisma.tradingAuditLog.findMany({
        where: {
          entityType,
          entityId,
        },
        orderBy: { createdAt: 'asc' },
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  async generateComplianceReport(
    fromDate: Date,
    toDate: Date
  ): Promise<{
    totalOrders: number;
    totalTrades: number;
    totalVolume: number;
    totalValue: number;
    ordersByType: Record<string, number>;
    tradesByStatus: Record<string, number>;
    topTraders: any[];
  }> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const [orders, trades, topTraders] = await Promise.all([
        prisma.order.findMany({
          where: {
            createdAt: {
              gte: fromDate,
              lte: toDate,
            },
          },
        }),
        prisma.trade.findMany({
          where: {
            matchedAt: {
              gte: fromDate,
              lte: toDate,
            },
          },
        }),
        prisma.trade.groupBy({
          by: ['buyOrderId'],
          where: {
            matchedAt: {
              gte: fromDate,
              lte: toDate,
            },
            status: TradeStatus.COMPLETED,
          },
          _sum: {
            sharesTraded: true,
            totalValue: true,
          },
          _count: {
            id: true,
          },
          orderBy: {
            _sum: {
              totalValue: 'desc',
            },
          },
          take: 10,
        }),
      ]);

      const ordersByType = orders.reduce((acc, order) => {
        acc[order.type] = (acc[order.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const tradesByStatus = trades.reduce((acc, trade) => {
        acc[trade.status] = (acc[trade.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalVolume = trades.reduce((sum, trade) => sum + ((trade as any).quantity || trade.sharesTraded), 0);
      const totalValue = trades.reduce((sum, trade) => sum + Number((trade as any).totalAmount || trade.totalValue), 0);

      return {
        totalOrders: orders.length,
        totalTrades: trades.length,
        totalVolume,
        totalValue,
        ordersByType,
        tradesByStatus,
        topTraders,
      };
    } finally {
      await prisma.$disconnect();
    }
  }
}

export const tradingAuditService = new TradingAuditService();