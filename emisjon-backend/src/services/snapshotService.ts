import { PrismaClient, SnapshotType, SnapshotReason } from '@prisma/client';
import { getTotalShares } from './shareholderService';

const prisma = new PrismaClient();

export async function createShareholderSnapshot(
  emissionId: string,
  type: SnapshotType,
  reason: SnapshotReason = 'FIRST_APPROVAL',
  createdById?: string
) {
  try {
    // Get all current shareholders with all fields
    const shareholders = await prisma.shareholder.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        sharesOwned: true,
        ownershipPercentage: true,
        userId: true
      },
      orderBy: {
        sharesOwned: 'desc'
      }
    });

    // Calculate total shares
    const totalShares = await getTotalShares();

    // Create snapshot with enhanced data
    const snapshot = await prisma.shareholderSnapshot.create({
      data: {
        emissionId,
        type,
        snapshotReason: reason,
        totalSharesBefore: totalShares, // Total shares before emission changes
        snapshotData: {
          shareholders,
          timestamp: new Date().toISOString(),
          shareholderCount: shareholders.length
        },
        totalShares,
        createdById
      }
    });

    return snapshot;
  } catch (error) {
    console.error('Failed to create snapshot:', error);
    throw error;
  }
}

export async function getEmissionSnapshots(emissionId: string) {
  return await prisma.shareholderSnapshot.findMany({
    where: { emissionId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getLatestSnapshot(emissionId: string, type?: SnapshotType) {
  return await prisma.shareholderSnapshot.findFirst({
    where: {
      emissionId,
      ...(type && { type })
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function hasBeforeApprovalSnapshot(emissionId: string): Promise<boolean> {
  const snapshot = await prisma.shareholderSnapshot.findFirst({
    where: {
      emissionId,
      type: 'BEFORE_APPROVAL'
    }
  });
  return !!snapshot;
}