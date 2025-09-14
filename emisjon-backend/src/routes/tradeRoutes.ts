import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { AuthRequest, authenticate } from '../middleware/authMiddleware';
import { requireTradeApprovalAccess, setRequestMetadata } from '../middleware/tradingMiddleware';
import prisma from '../config/database';
import { TradeStatus } from '@prisma/client';
import { notificationService } from '../services/notificationService';
import { tradingAuditService } from '../services/tradingAuditService';

const router: ExpressRouter = Router();

router.use(authenticate);
router.use(setRequestMetadata);

router.get('/pending', requireTradeApprovalAccess, async (_req: AuthRequest, res) => {
  try {
    const trades = await prisma.trade.findMany({
      where: {
        status: TradeStatus.PENDING_APPROVAL,
      },
      include: {
        buyOrder: {
          include: {
            shareholder: {
              select: {
                id: true,
                name: true,
                userId: true,
              },
            },
          },
        },
        sellOrder: {
          include: {
            shareholder: {
              select: {
                id: true,
                name: true,
                userId: true,
              },
            },
          },
        },
      },
      orderBy: {
        matchedAt: 'asc',
      },
    });

    return res.json({
      success: true,
      data: trades,
      count: trades.length,
    });
  } catch (error: any) {
    console.error('Error fetching pending trades:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch pending trades' 
    });
  }
});

router.post('/:tradeId/approve', requireTradeApprovalAccess, async (req: AuthRequest, res) => {
  try {
    const { tradeId } = req.params;
    const { notes } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const trade = await tx.trade.findUnique({
        where: { id: tradeId },
        include: {
          buyOrder: true,
          sellOrder: true,
        },
      });

      if (!trade) {
        throw new Error('Trade not found');
      }

      if (trade.status !== TradeStatus.PENDING_APPROVAL) {
        throw new Error('Trade is not pending approval');
      }

      const updatedTrade = await tx.trade.update({
        where: { id: tradeId },
        data: {
          status: TradeStatus.COMPLETED,
          approvedBy: req.userId!,
          approvedAt: new Date(),
          notes,
        },
      });

      const [buyerShareholder, sellerShareholder] = await Promise.all([
        tx.shareholder.findUnique({
          where: { id: (trade as any).buyerShareholderId },
        }),
        tx.shareholder.findUnique({
          where: { id: (trade as any).sellerShareholderId },
        }),
      ]);

      if (!buyerShareholder || !sellerShareholder) {
        throw new Error('Shareholder not found');
      }

      await tx.shareholder.update({
        where: { id: (trade as any).buyerShareholderId },
        data: {
          totalShares: (buyerShareholder as any).totalShares + (trade as any).quantity,
          availableShares: (buyerShareholder as any).availableShares + (trade as any).quantity,
        },
      });

      await tx.shareholder.update({
        where: { id: (trade as any).sellerShareholderId },
        data: {
          totalShares: (sellerShareholder as any).totalShares - (trade as any).quantity,
          lockedShares: Math.max(0, (sellerShareholder as any).lockedShares - (trade as any).quantity),
        },
      });

      await tradingAuditService.logTradeApproval(tx, updatedTrade, req.userId!, true, notes);

      await tradingAuditService.logShareTransfer(
        tx,
        (trade as any).sellerShareholderId,
        (trade as any).buyerShareholderId,
        (trade as any).quantity,
        req.userId!,
        trade.id
      );

      return updatedTrade;
    });

    await notificationService.notifyTradeApproval(result, true, req.userId!);

    return res.json({
      success: true,
      message: 'Trade approved successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Error approving trade:', error);
    return res.status(400).json({ 
      error: error.message || 'Failed to approve trade' 
    });
  }
});

router.post('/:tradeId/reject', requireTradeApprovalAccess, async (req: AuthRequest, res) => {
  try {
    const { tradeId } = req.params;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({ 
        error: 'Rejection reason is required' 
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const trade = await tx.trade.findUnique({
        where: { id: tradeId },
        include: {
          buyOrder: true,
          sellOrder: true,
        },
      });

      if (!trade) {
        throw new Error('Trade not found');
      }

      if (trade.status !== TradeStatus.PENDING_APPROVAL) {
        throw new Error('Trade is not pending approval');
      }

      const updatedTrade = await tx.trade.update({
        where: { id: tradeId },
        data: {
          status: TradeStatus.REJECTED,
          rejectedBy: req.userId!,
          rejectedAt: new Date(),
          rejectionReason: reason,
          notes,
        },
      });

      if (trade.sellOrder.type === 'SELL') {
        const sellerShareholder = await tx.shareholder.findUnique({
          where: { id: (trade as any).sellerShareholderId },
        });

        if (sellerShareholder) {
          await tx.shareholder.update({
            where: { id: (trade as any).sellerShareholderId },
            data: {
              availableShares: (sellerShareholder as any).availableShares + (trade as any).quantity,
              lockedShares: Math.max(0, (sellerShareholder as any).lockedShares - (trade as any).quantity),
            },
          });
        }
      }

      await tx.order.updateMany({
        where: {
          id: {
            in: [trade.buyOrderId, trade.sellOrderId],
          },
          status: 'FILLED',
        },
        data: {
          status: 'OPEN',
          remainingQuantity: {
            increment: (trade as any).quantity,
          },
          filledQuantity: {
            decrement: (trade as any).quantity,
          },
        },
      });

      await tradingAuditService.logTradeApproval(tx, updatedTrade, req.userId!, false, notes);
      await tradingAuditService.logTradeCancellation(tx, updatedTrade, req.userId!, reason);

      return updatedTrade;
    });

    await notificationService.notifyTradeApproval(result, false, req.userId!);

    return res.json({
      success: true,
      message: 'Trade rejected successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Error rejecting trade:', error);
    return res.status(400).json({ 
      error: error.message || 'Failed to reject trade' 
    });
  }
});

router.get('/history', authenticate, async (req: AuthRequest, res) => {
  try {
    const { shareholderId, status, fromDate, toDate } = req.query;

    const where: any = {};

    if (shareholderId) {
      where.OR = [
        { buyerShareholderId: shareholderId },
        { sellerShareholderId: shareholderId },
      ];
    }

    if (status && Object.values(TradeStatus).includes(status as TradeStatus)) {
      where.status = status as TradeStatus;
    }

    if (fromDate || toDate) {
      where.matchedAt = {};
      if (fromDate) {
        where.matchedAt.gte = new Date(fromDate as string);
      }
      if (toDate) {
        where.matchedAt.lte = new Date(toDate as string);
      }
    }

    const isAdmin = req.userRole === 'ADMIN';
    
    if (!isAdmin) {
      const userShareholders = await prisma.shareholder.findMany({
        where: { userId: req.userId! },
        select: { id: true },
      });

      const shareholderIds = userShareholders.map(s => s.id);
      
      if (shareholderIds.length > 0) {
        where.OR = [
          { buyerShareholderId: { in: shareholderIds } },
          { sellerShareholderId: { in: shareholderIds } },
        ];
      } else {
        return res.json({
          success: true,
          data: [],
          count: 0,
        });
      }
    }

    const trades = await prisma.trade.findMany({
      where,
      include: {
        buyOrder: {
          include: {
            shareholder: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        sellOrder: {
          include: {
            shareholder: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        matchedAt: 'desc',
      },
      take: 100,
    });

    return res.json({
      success: true,
      data: trades,
      count: trades.length,
    });
  } catch (error: any) {
    console.error('Error fetching trade history:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch trade history' 
    });
  }
});

router.get('/:tradeId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { tradeId } = req.params;

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        buyOrder: {
          include: {
            shareholder: {
              select: {
                id: true,
                name: true,
                userId: true,
              },
            },
          },
        },
        sellOrder: {
          include: {
            shareholder: {
              select: {
                id: true,
                name: true,
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!trade) {
      return res.status(404).json({ 
        error: 'Trade not found' 
      });
    }

    const isAdmin = req.userRole === 'ADMIN';
    const isBuyer = (trade as any).buyOrder?.shareholder?.userId === req.userId;
    const isSeller = (trade as any).sellOrder?.shareholder?.userId === req.userId;

    if (!isAdmin && !isBuyer && !isSeller) {
      return res.status(403).json({ 
        error: 'You do not have access to this trade' 
      });
    }

    return res.json({
      success: true,
      data: trade,
    });
  } catch (error: any) {
    console.error('Error fetching trade:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch trade' 
    });
  }
});

export default router;