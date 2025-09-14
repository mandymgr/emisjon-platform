import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GeneralAuditParams {
  tableName: string;
  recordId: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  oldValues?: any;
  newValues?: any;
  changedById?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Create a general audit log entry for any database operation
 */
export async function createGeneralAuditLog({
  tableName,
  recordId,
  action,
  oldValues = null,
  newValues = null,
  changedById = null,
  ipAddress = null,
  userAgent = null
}: GeneralAuditParams) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        tableName,
        recordId,
        action,
        oldValues,
        newValues,
        changedById,
        ipAddress,
        userAgent
      }
    });
    return auditLog;
  } catch (error) {
    console.error('Failed to create general audit log:', error);
    // Don't throw - audit logging should not break the main operation
    return null;
  }
}

/**
 * Get audit logs for a specific table and record
 */
export async function getRecordAuditLogs(tableName: string, recordId: string) {
  return await prisma.auditLog.findMany({
    where: {
      tableName,
      recordId
    },
    include: {
      changedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    },
    orderBy: { changedAt: 'desc' }
  });
}

/**
 * Get all audit logs for a specific table
 */
export async function getTableAuditLogs(tableName: string) {
  return await prisma.auditLog.findMany({
    where: { tableName },
    include: {
      changedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    },
    orderBy: { changedAt: 'desc' }
  });
}

/**
 * Get all audit logs by a specific user
 */
export async function getUserGeneralAuditLogs(userId: string) {
  return await prisma.auditLog.findMany({
    where: { changedById: userId },
    orderBy: { changedAt: 'desc' }
  });
}

/**
 * Get audit logs within a date range
 */
export async function getAuditLogsByDateRange(
  startDate: Date,
  endDate: Date,
  tableName?: string
) {
  return await prisma.auditLog.findMany({
    where: {
      changedAt: {
        gte: startDate,
        lte: endDate
      },
      ...(tableName && { tableName })
    },
    include: {
      changedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    },
    orderBy: { changedAt: 'desc' }
  });
}

/**
 * Helper function to extract request info for audit logging
 */
export function extractRequestInfo(req: any) {
  return {
    ipAddress: req.ip || req.connection?.remoteAddress || null,
    userAgent: req.headers?.['user-agent'] || null,
    userId: req.userId || null
  };
}