import prisma from '../config/database';
import { createShareholderSnapshot, hasBeforeApprovalSnapshot } from './snapshotService';
import { createAuditLog } from './auditService';
import { updateOwnershipPercentages } from './shareholderService';

export async function createSubscription(userId: string, data: {
  emissionId: string;
  sharesRequested: number;
}) {
  // Check if emission exists and is active
  const emission = await prisma.emission.findUnique({
    where: { id: data.emissionId }
  });

  if (!emission) {
    throw new Error('Emission not found');
  }

  if (emission.status !== 'ACTIVE') {
    throw new Error('Emission is not active for subscriptions');
  }

  // Check if subscription already exists
  const existingSubscription = await prisma.emissionSubscription.findUnique({
    where: {
      emissionId_userId: {
        emissionId: data.emissionId,
        userId: userId
      }
    }
  });

  if (existingSubscription) {
    throw new Error('You have already subscribed to this emission');
  }

  // Create subscription
  return await prisma.emissionSubscription.create({
    data: {
      emissionId: data.emissionId,
      userId: userId,
      sharesRequested: data.sharesRequested,
      status: 'PENDING'
    },
    include: {
      emission: true,
      user: true
    }
  });
}

export async function getUserSubscriptions(userId: string) {
  return await prisma.emissionSubscription.findMany({
    where: { userId },
    include: {
      emission: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function getEmissionSubscriptions(emissionId: string) {
  return await prisma.emissionSubscription.findMany({
    where: { emissionId },
    include: {
      user: {
        include: {
          shareholder: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function getAllSubscriptions() {
  return await prisma.emissionSubscription.findMany({
    include: {
      emission: true,
      user: {
        include: {
          shareholder: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function approveSubscription(
  subscriptionId: string,
  adminId: string,
  sharesAllocated: number
) {
  const subscription = await prisma.emissionSubscription.findUnique({
    where: { id: subscriptionId },
    include: {
      user: {
        include: {
          shareholder: true
        }
      }
    }
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  if (subscription.status !== 'PENDING') {
    throw new Error('Subscription is not pending');
  }

  // Check if this is the first approval for this emission and create snapshot
  const hasSnapshot = await hasBeforeApprovalSnapshot(subscription.emissionId);
  if (!hasSnapshot) {
    await createShareholderSnapshot(subscription.emissionId, 'BEFORE_APPROVAL');
  }

  // Start a transaction to update subscription and shareholder
  const result = await prisma.$transaction(async (tx) => {
    // Update subscription
    const updatedSubscription = await tx.emissionSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'APPROVED',
        sharesAllocated: sharesAllocated,
        approvedById: adminId,
        approvedAt: new Date()
      },
      include: {
        emission: true,
        user: {
          include: {
            shareholder: true
          }
        }
      }
    });

    // Update shareholder's shares if they exist
    if (subscription.user.shareholder) {
      await tx.shareholder.update({
        where: { id: subscription.user.shareholder.id },
        data: {
          sharesOwned: {
            increment: sharesAllocated
          }
        }
      });
    } else {
      // Create shareholder record if it doesn't exist
      await tx.shareholder.create({
        data: {
          userId: subscription.userId,
          name: subscription.user.name,
          email: subscription.user.email,
          sharesOwned: sharesAllocated
        }
      });
    }

    // Log audit entry
    await createAuditLog({
      emissionId: subscription.emissionId,
      userId: adminId,
      action: 'SUBSCRIPTION_APPROVED',
      metadata: {
        subscriptionId,
        subscriberId: subscription.userId,
        sharesAllocated,
        sharesRequested: subscription.sharesRequested
      }
    });

    // Note: Ownership percentages should be updated outside the transaction
    // to avoid timeout issues with large shareholder counts

    return updatedSubscription;
  });
  
  // Update ownership percentages after transaction completes
  try {
    await updateOwnershipPercentages();
  } catch (error) {
    console.error('Failed to update ownership percentages:', error);
    // Don't fail the approval if percentage update fails
  }
  
  return result;
}

export async function rejectSubscription(subscriptionId: string, adminId: string) {
  const subscription = await prisma.emissionSubscription.findUnique({
    where: { id: subscriptionId }
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  if (subscription.status !== 'PENDING') {
    throw new Error('Subscription is not pending');
  }

  return await prisma.emissionSubscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'REJECTED',
      approvedById: adminId,
      approvedAt: new Date()
    },
    include: {
      emission: true,
      user: true
    }
  });
}

export async function updateSubscription(
  subscriptionId: string,
  userId: string,
  sharesRequested: number
) {
  const subscription = await prisma.emissionSubscription.findUnique({
    where: { id: subscriptionId }
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  if (subscription.userId !== userId) {
    throw new Error('You can only update your own subscriptions');
  }

  if (subscription.status !== 'PENDING') {
    throw new Error('Cannot update subscription that is not pending');
  }

  return await prisma.emissionSubscription.update({
    where: { id: subscriptionId },
    data: {
      sharesRequested
    },
    include: {
      emission: true
    }
  });
}

export async function deleteSubscription(subscriptionId: string, userId: string) {
  const subscription = await prisma.emissionSubscription.findUnique({
    where: { id: subscriptionId }
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  if (subscription.userId !== userId) {
    throw new Error('You can only delete your own subscriptions');
  }

  if (subscription.status !== 'PENDING') {
    throw new Error('Cannot delete subscription that is not pending');
  }

  await prisma.emissionSubscription.delete({
    where: { id: subscriptionId }
  });
}