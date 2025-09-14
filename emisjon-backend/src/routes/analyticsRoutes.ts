import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { AuthRequest, authenticate } from '../middleware/authMiddleware';
import { requireAnalyticsAccess, requireComplianceAccess } from '../middleware/tradingMiddleware';
import prisma from '../config/database';
import { tradingAuditService } from '../services/tradingAuditService';
import { TradeStatus, OrderStatus, TradingActionType } from '@prisma/client';

const router: ExpressRouter = Router();

router.use(authenticate);

router.get('/volume', requireAnalyticsAccess, async (req: AuthRequest, res) => {
  try {
    const { period = '7d', shareholderId } = req.query;
    
    const now = new Date();
    let fromDate = new Date();
    
    switch (period) {
      case '24h':
        fromDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        fromDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        fromDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        fromDate.setDate(now.getDate() - 90);
        break;
      default:
        fromDate.setDate(now.getDate() - 7);
    }

    const where: any = {
      matchedAt: {
        gte: fromDate,
        lte: now,
      },
      status: TradeStatus.COMPLETED,
    };

    if (shareholderId) {
      where.OR = [
        { buyerShareholderId: shareholderId },
        { sellerShareholderId: shareholderId },
      ];
    }

    const trades = await prisma.trade.findMany({
      where,
      select: {
        quantity: true,
        price: true,
        totalAmount: true,
        matchedAt: true,
      },
    });

    const volumeByDay: Record<string, { volume: number; value: number; trades: number }> = {};
    
    trades.forEach(trade => {
      const day = trade.matchedAt.toISOString().split('T')[0];
      if (!volumeByDay[day]) {
        volumeByDay[day] = { volume: 0, value: 0, trades: 0 };
      }
      volumeByDay[day].volume += trade.quantity;
      volumeByDay[day].value += Number(trade.totalAmount);
      volumeByDay[day].trades += 1;
    });

    const totalVolume = trades.reduce((sum, t) => sum + t.quantity, 0);
    const totalValue = trades.reduce((sum, t) => sum + Number(t.totalAmount), 0);
    const averagePrice = totalValue / totalVolume || 0;

    res.json({
      success: true,
      data: {
        period,
        totalVolume,
        totalValue,
        totalTrades: trades.length,
        averagePrice,
        dailyBreakdown: volumeByDay,
      },
    });
  } catch (error: any) {
    console.error('Error fetching volume analytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch volume analytics' 
    });
  }
});

router.get('/price-history', requireAnalyticsAccess, async (req: AuthRequest, res) => {
  try {
    const { period = '7d' } = req.query;
    
    const now = new Date();
    let fromDate = new Date();
    
    switch (period) {
      case '24h':
        fromDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        fromDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        fromDate.setDate(now.getDate() - 30);
        break;
      default:
        fromDate.setDate(now.getDate() - 7);
    }

    const trades = await prisma.trade.findMany({
      where: {
        matchedAt: {
          gte: fromDate,
          lte: now,
        },
        status: TradeStatus.COMPLETED,
      },
      select: {
        price: true,
        quantity: true,
        matchedAt: true,
      },
      orderBy: {
        matchedAt: 'asc',
      },
    });

    const priceData = trades.map(trade => ({
      timestamp: trade.matchedAt,
      price: trade.price,
      volume: trade.quantity,
    }));

    const latestPrice = priceData.length > 0 ? priceData[priceData.length - 1].price : null;
    const openPrice = priceData.length > 0 ? priceData[0].price : null;
    const highPrice = priceData.length > 0 ? Math.max(...priceData.map(d => Number(d.price))) : null;
    const lowPrice = priceData.length > 0 ? Math.min(...priceData.map(d => Number(d.price))) : null;
    
    const priceChange = openPrice && latestPrice ? Number(latestPrice) - Number(openPrice) : 0;
    const priceChangePercent = openPrice ? (priceChange / Number(openPrice)) * 100 : 0;

    res.json({
      success: true,
      data: {
        period,
        latestPrice,
        openPrice,
        highPrice,
        lowPrice,
        priceChange,
        priceChangePercent,
        priceHistory: priceData,
      },
    });
  } catch (error: any) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch price history' 
    });
  }
});

router.get('/top-traders', requireAnalyticsAccess, async (req: AuthRequest, res) => {
  try {
    const { period = '30d', limit = 10 } = req.query;
    
    const now = new Date();
    let fromDate = new Date();
    
    switch (period) {
      case '7d':
        fromDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        fromDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        fromDate.setDate(now.getDate() - 90);
        break;
      default:
        fromDate.setDate(now.getDate() - 30);
    }

    const [topBuyers, topSellers] = await Promise.all([
      prisma.trade.groupBy({
        by: ['buyerShareholderId'],
        where: {
          matchedAt: {
            gte: fromDate,
            lte: now,
          },
          status: TradeStatus.COMPLETED,
        },
        _sum: {
          quantity: true,
          totalAmount: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            totalAmount: 'desc',
          },
        },
        take: Number(limit),
      }),
      prisma.trade.groupBy({
        by: ['sellerShareholderId'],
        where: {
          matchedAt: {
            gte: fromDate,
            lte: now,
          },
          status: TradeStatus.COMPLETED,
        },
        _sum: {
          quantity: true,
          totalAmount: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            totalAmount: 'desc',
          },
        },
        take: Number(limit),
      }),
    ]);

    const buyerIds = topBuyers.map(b => b.buyerShareholderId);
    const sellerIds = topSellers.map(s => s.sellerShareholderId);
    
    const shareholders = await prisma.shareholder.findMany({
      where: {
        id: {
          in: [...buyerIds, ...sellerIds],
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const shareholderMap = new Map(shareholders.map(s => [s.id, s.name]));

    const topBuyersWithNames = topBuyers.map(buyer => ({
      shareholderId: buyer.buyerShareholderId,
      shareholderName: shareholderMap.get(buyer.buyerShareholderId) || 'Unknown',
      totalVolume: buyer._sum.quantity || 0,
      totalValue: buyer._sum.totalAmount || 0,
      totalTrades: buyer._count.id,
    }));

    const topSellersWithNames = topSellers.map(seller => ({
      shareholderId: seller.sellerShareholderId,
      shareholderName: shareholderMap.get(seller.sellerShareholderId) || 'Unknown',
      totalVolume: seller._sum.quantity || 0,
      totalValue: seller._sum.totalAmount || 0,
      totalTrades: seller._count.id,
    }));

    res.json({
      success: true,
      data: {
        period,
        topBuyers: topBuyersWithNames,
        topSellers: topSellersWithNames,
      },
    });
  } catch (error: any) {
    console.error('Error fetching top traders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch top traders' 
    });
  }
});

router.get('/order-status-summary', requireAnalyticsAccess, async (_req: AuthRequest, res) => {
  try {
    const orderStatusSummary = await prisma.order.groupBy({
      by: ['status', 'type'],
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
        remainingQuantity: true,
        filledQuantity: true,
      },
    });

    const summary = orderStatusSummary.reduce((acc: any, item) => {
      const key = `${item.type}_${item.status}`;
      acc[key] = {
        count: item._count.id,
        totalQuantity: item._sum.quantity || 0,
        remainingQuantity: item._sum.remainingQuantity || 0,
        filledQuantity: item._sum.filledQuantity || 0,
      };
      return acc;
    }, {});

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error('Error fetching order status summary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch order status summary' 
    });
  }
});

router.get('/audit-logs', requireComplianceAccess, async (_req: AuthRequest, res) => {
  try {
    const { userId, entityType, entityId, action, fromDate, toDate, limit = 100 } = _req.query;

    const filters: any = {};
    
    if (userId) filters.userId = userId;
    if (entityType) filters.entityType = entityType;
    if (entityId) filters.entityId = entityId;
    if (action && Object.values(TradingActionType).includes(action as TradingActionType)) {
      filters.action = action as TradingActionType;
    }
    if (fromDate) filters.fromDate = new Date(fromDate as string);
    if (toDate) filters.toDate = new Date(toDate as string);

    const logs = await tradingAuditService.getAuditLogs(filters, Number(limit));

    res.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch audit logs' 
    });
  }
});

router.get('/compliance-report', requireComplianceAccess, async (_req: AuthRequest, res) => {
  try {
    const { fromDate, toDate } = _req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({ 
        error: 'fromDate and toDate are required' 
      });
    }

    const report = await tradingAuditService.generateComplianceReport(
      new Date(fromDate as string),
      new Date(toDate as string)
    );

    return res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('Error generating compliance report:', error);
    return res.status(500).json({ 
      error: 'Failed to generate compliance report' 
    });
  }
});

router.get('/liquidity-metrics', requireAnalyticsAccess, async (_req: AuthRequest, res) => {
  try {
    const [openBuyOrders, openSellOrders, recentTrades] = await Promise.all([
      prisma.order.aggregate({
        where: {
          type: 'BUY',
          status: {
            in: [OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED],
          },
        },
        _sum: {
          remainingQuantity: true,
        },
        _count: {
          id: true,
        },
      }),
      prisma.order.aggregate({
        where: {
          type: 'SELL',
          status: {
            in: [OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED],
          },
        },
        _sum: {
          remainingQuantity: true,
        },
        _count: {
          id: true,
        },
      }),
      prisma.trade.findMany({
        where: {
          status: TradeStatus.COMPLETED,
        },
        orderBy: {
          matchedAt: 'desc',
        },
        take: 100,
        select: {
          price: true,
          quantity: true,
        },
      }),
    ]);

    const bidVolume = openBuyOrders._sum.remainingQuantity || 0;
    const askVolume = openSellOrders._sum.remainingQuantity || 0;
    const bidOrderCount = openBuyOrders._count.id;
    const askOrderCount = openSellOrders._count.id;
    
    const prices = recentTrades.map(t => Number(t.price));
    const priceVolatility = prices.length > 1 
      ? Math.sqrt(prices.reduce((sum, price, i) => {
          if (i === 0) return 0;
          const diff = price - prices[i - 1];
          return sum + diff * diff;
        }, 0) / (prices.length - 1))
      : 0;

    const liquidityScore = (bidVolume + askVolume) / 2;
    const marketDepth = bidOrderCount + askOrderCount;

    res.json({
      success: true,
      data: {
        bidVolume,
        askVolume,
        bidOrderCount,
        askOrderCount,
        liquidityScore,
        marketDepth,
        priceVolatility,
        volumeImbalance: bidVolume - askVolume,
      },
    });
  } catch (error: any) {
    console.error('Error fetching liquidity metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch liquidity metrics' 
    });
  }
});

export default router;