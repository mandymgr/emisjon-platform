import { Prisma, NotificationType, Order, Trade } from '@prisma/client';
import prisma from '../config/database';

interface NotificationData {
  orderId?: string;
  tradeId?: string;
  shareholderId?: string;
  [key: string]: any;
}

class NotificationService {
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    _data?: NotificationData
  ): Promise<void> {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
      },
    });
  }

  async notifyUser(
    tx: Prisma.TransactionClient,
    userId: string,
    type: NotificationType,
    message: string,
    _data?: NotificationData
  ): Promise<void> {
    await tx.notification.create({
      data: {
        userId,
        type,
        title: this.getNotificationTitle(type),
        message,
      },
    });
  }

  async createOrderNotification(
    tx: Prisma.TransactionClient,
    order: Order,
    userId: string
  ): Promise<void> {
    const orderType = order.type === 'BUY' ? 'Buy' : 'Sell';
    
    await this.notifyUser(
      tx,
      userId,
      'SYSTEM_ALERT' as NotificationType,
      `${orderType} order placed for ${(order as any).quantity || order.shares} shares at ${(order as any).price || order.pricePerShare} NOK`,
      {
        orderId: order.id,
        shareholderId: (order as any).shareholderId,
        orderType: order.type,
        quantity: (order as any).quantity || order.shares,
        price: (order as any).price || order.pricePerShare,
      }
    );
  }

  async createOrderCancellationNotification(
    tx: Prisma.TransactionClient,
    order: Order,
    userId: string
  ): Promise<void> {
    const orderType = order.type === 'BUY' ? 'Buy' : 'Sell';
    
    await this.notifyUser(
      tx,
      userId,
      'SYSTEM_ALERT' as NotificationType,
      `${orderType} order cancelled. Original: ${(order as any).quantity || order.shares} shares at ${(order as any).price || order.pricePerShare} NOK`,
      {
        orderId: order.id,
        shareholderId: (order as any).shareholderId,
        orderType: order.type,
        quantity: (order as any).quantity || order.shares,
        price: (order as any).price || order.pricePerShare,
      }
    );
  }

  async createTradeNotification(
    tx: Prisma.TransactionClient,
    trade: Trade
  ): Promise<void> {
    const [buyerShareholder, sellerShareholder] = await Promise.all([
      tx.shareholder.findUnique({
        where: { id: (trade as any).buyerShareholderId },
        select: { userId: true, name: true },
      }),
      tx.shareholder.findUnique({
        where: { id: (trade as any).sellerShareholderId },
        select: { userId: true, name: true },
      }),
    ]);

    if (buyerShareholder?.userId) {
      await this.notifyUser(
        tx,
        buyerShareholder.userId,
        'SYSTEM_ALERT' as NotificationType,
        `Bought ${(trade as any).quantity || trade.sharesTraded} shares from ${sellerShareholder?.name} at ${(trade as any).price || trade.pricePerShare} NOK`,
        {
          tradeId: trade.id,
          orderId: trade.buyOrderId,
          shareholderId: (trade as any).buyerShareholderId,
          quantity: (trade as any).quantity || trade.sharesTraded,
          price: (trade as any).price || trade.pricePerShare,
          totalAmount: (trade as any).totalAmount || trade.totalValue,
        }
      );
    }

    if (sellerShareholder?.userId) {
      await this.notifyUser(
        tx,
        sellerShareholder.userId,
        'SYSTEM_ALERT' as NotificationType,
        `Sold ${(trade as any).quantity || trade.sharesTraded} shares to ${buyerShareholder?.name} at ${(trade as any).price || trade.pricePerShare} NOK`,
        {
          tradeId: trade.id,
          orderId: trade.sellOrderId,
          shareholderId: (trade as any).sellerShareholderId,
          quantity: (trade as any).quantity || trade.sharesTraded,
          price: (trade as any).price || trade.pricePerShare,
          totalAmount: (trade as any).totalAmount || trade.totalValue,
        }
      );
    }
  }

  async notifyTradeApproval(
    trade: Trade,
    approved: boolean,
    approvedBy: string
  ): Promise<void> {
    const status = approved ? 'approved' : 'rejected';
    
    const [buyerShareholder, sellerShareholder] = await Promise.all([
      prisma.shareholder.findUnique({
        where: { id: (trade as any).buyerShareholderId },
        select: { userId: true },
      }),
      prisma.shareholder.findUnique({
        where: { id: (trade as any).sellerShareholderId },
        select: { userId: true },
      }),
    ]);

    const notificationType = 'SYSTEM_ALERT' as NotificationType;
    const message = `Trade ${status}: ${(trade as any).quantity || trade.sharesTraded} shares at ${(trade as any).price || trade.pricePerShare} NOK`;

    const notifications = [];
    
    if (buyerShareholder?.userId) {
      notifications.push({
        userId: buyerShareholder.userId,
        type: notificationType,
        title: this.getNotificationTitle(notificationType),
        message,
        data: {
          tradeId: trade.id,
          approved,
          approvedBy,
        },
        read: false,
      });
    }

    if (sellerShareholder?.userId) {
      notifications.push({
        userId: sellerShareholder.userId,
        type: notificationType,
        title: this.getNotificationTitle(notificationType),
        message,
        data: {
          tradeId: trade.id,
          approved,
          approvedBy,
        },
        read: false,
      });
    }

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications as any,
      });
    }
  }

  async notifyAdminsOfPendingTrade(trade: Trade): Promise<void> {
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        level: { gte: 2 },
      },
      select: { id: true },
    });

    const notifications = admins.map(admin => ({
      userId: admin.id,
      type: 'TRADE_PENDING_APPROVAL' as NotificationType,
      title: 'Trade Pending Approval',
      message: `New trade requires approval: ${(trade as any).quantity || trade.sharesTraded} shares at ${(trade as any).price || trade.pricePerShare} NOK`,
      data: {
        tradeId: trade.id,
        quantity: (trade as any).quantity || trade.sharesTraded,
        price: (trade as any).price || trade.pricePerShare,
        totalAmount: (trade as any).totalAmount || trade.totalValue,
      },
      isRead: false,
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications as any,
      });
    }
  }

  async getUserNotifications(
    userId: string,
    unreadOnly: boolean = false
  ): Promise<any[]> {
    return await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  private getNotificationTitle(type: NotificationType): string {
    const titles: Record<string, string> = {
      ORDER_PLACED: 'Order Placed',
      ORDER_FILLED: 'Order Filled',
      ORDER_PARTIALLY_FILLED: 'Order Partially Filled',
      ORDER_CANCELLED: 'Order Cancelled',
      TRADE_EXECUTED: 'Trade Executed',
      TRADE_PENDING_APPROVAL: 'Trade Pending Approval',
      TRADE_COMPLETED: 'Trade Completed',
      TRADE_CANCELLED: 'Trade Cancelled',
      SHARE_TRANSFER: 'Share Transfer',
      SYSTEM_ALERT: 'System Alert',
      AUDIT_LOG: 'Audit Log Entry',
    };
    return titles[type as string] || 'Notification';
  }

  async sendBulkNotification(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    _data?: NotificationData
  ): Promise<void> {
    const notifications = userIds.map(userId => ({
      userId,
      type,
      title,
      message,
    }));

    await prisma.notification.createMany({
      data: notifications as any,
    });
  }

  async createOrderExpirationNotification(
    tx: Prisma.TransactionClient,
    order: any,
    userId: string
  ): Promise<void> {
    await tx.notification.create({
      data: {
        userId,
        type: NotificationType.ORDER_EXPIRED,
        title: 'Order Expired',
        message: `Your ${order.type} order for ${(order as any).quantity || order.shares} shares has expired`,
        data: {
          orderId: order.id,
          orderType: order.type,
          shares: (order as any).quantity || order.shares,
          price: (order as any).price || order.pricePerShare,
          expiredAt: new Date().toISOString(),
        },
        read: false,
      } as any,
    });
  }

  async deleteOldNotifications(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        read: true,
      },
    });

    return result.count;
  }
}

export const notificationService = new NotificationService();