import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import * as snapshotService from '../services/snapshotService';

const prisma = new PrismaClient();

// Get all snapshots (admin only)
export const getAllSnapshots = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    
    // Only admins can view snapshots
    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const snapshots = await prisma.shareholderSnapshot.findMany({
      include: {
        emission: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(snapshots);
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    res.status(500).json({ error: 'Failed to fetch snapshots' });
  }
};

// Get a specific snapshot by ID
export const getSnapshotById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;

    const snapshot = await prisma.shareholderSnapshot.findUnique({
      where: { id },
      include: {
        emission: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!snapshot) {
      res.status(404).json({ error: 'Snapshot not found' });
      return;
    }

    res.json(snapshot);
  } catch (error) {
    console.error('Error fetching snapshot:', error);
    res.status(500).json({ error: 'Failed to fetch snapshot' });
  }
};

// Create manual snapshot (admin level 2 only)
export const createManualSnapshot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userLevel = req.user?.level;
    const userId = req.userId;
    
    if (userRole !== 'ADMIN' || userLevel !== 2) {
      res.status(403).json({ error: 'Admin Level 2 access required' });
      return;
    }

    const { emissionId } = req.params;

    // Check if emission exists
    const emission = await prisma.emission.findUnique({
      where: { id: emissionId }
    });

    if (!emission) {
      res.status(404).json({ error: 'Emission not found' });
      return;
    }

    // Create manual snapshot
    const snapshot = await snapshotService.createShareholderSnapshot(
      emissionId,
      'MANUAL',
      'MANUAL',
      userId
    );

    res.status(201).json(snapshot);
  } catch (error) {
    console.error('Error creating manual snapshot:', error);
    res.status(500).json({ error: 'Failed to create snapshot' });
  }
};

// Compare two snapshots
export const compareSnapshots = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    
    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { beforeId, afterId } = req.query;

    if (!beforeId || !afterId) {
      res.status(400).json({ error: 'Both beforeId and afterId are required' });
      return;
    }

    const [beforeSnapshot, afterSnapshot] = await Promise.all([
      prisma.shareholderSnapshot.findUnique({ where: { id: beforeId as string } }),
      prisma.shareholderSnapshot.findUnique({ where: { id: afterId as string } })
    ]);

    if (!beforeSnapshot || !afterSnapshot) {
      res.status(404).json({ error: 'One or both snapshots not found' });
      return;
    }

    // Calculate comparison data
    const comparison = {
      before: beforeSnapshot,
      after: afterSnapshot,
      totalSharesChange: afterSnapshot.totalShares - beforeSnapshot.totalShares,
      percentageChange: ((afterSnapshot.totalShares - beforeSnapshot.totalShares) / beforeSnapshot.totalShares) * 100
    };

    res.json(comparison);
  } catch (error) {
    console.error('Error comparing snapshots:', error);
    res.status(500).json({ error: 'Failed to compare snapshots' });
  }
};