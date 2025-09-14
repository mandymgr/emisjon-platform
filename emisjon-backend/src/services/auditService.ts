import { PrismaClient, AuditAction } from '@prisma/client';

const prisma = new PrismaClient();

interface AuditLogParams {
  emissionId: string;
  userId: string;
  action: AuditAction;
  changes?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog({
  emissionId,
  userId,
  action,
  changes = null,
  metadata = null,
  ipAddress = undefined,
  userAgent = undefined
}: AuditLogParams) {
  try {
    const auditLog = await prisma.emissionAuditLog.create({
      data: {
        emissionId,
        userId,
        action,
        changes,
        metadata,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined
      }
    });
    return auditLog;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main operation
    return null;
  }
}

export async function getEmissionAuditLogs(emissionId: string) {
  return await prisma.emissionAuditLog.findMany({
    where: { emissionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getUserAuditLogs(userId: string) {
  return await prisma.emissionAuditLog.findMany({
    where: { userId },
    include: {
      emission: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}