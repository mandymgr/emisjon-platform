export interface Emission {
  id: string;
  title: string;
  description: string;
  presentationFileUrl?: string;
  sharesBefore: number;
  newSharesOffered: number;
  sharesAfter: number;
  pricePerShare: number;
  startDate: string;
  endDate: string;
  status: 'PREVIEW' | 'ACTIVE' | 'COMPLETED' | 'FINALIZED';
  isPreview: boolean;
  totalSharesSubscribed?: number;
  finalizedAt?: string;
  finalizedById?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  finalizedBy?: {
    id: string;
    name: string;
    email: string;
  };
  snapshots?: ShareholderSnapshot[];
  auditLogs?: EmissionAuditLog[];
}

export interface CreateEmissionData {
  title: string;
  description: string;
  presentationFileUrl?: string;
  presentationFile?: File;
  sharesBefore: number;
  newSharesOffered: number;
  pricePerShare: number;
  startDate: string;
  endDate: string;
  status?: 'PREVIEW' | 'ACTIVE' | 'COMPLETED' | 'FINALIZED';
  scheduledDate?: string;
  isPreview?: boolean;
}

export type UpdateEmissionData = Partial<CreateEmissionData>;

export interface ShareholderSnapshot {
  id: string;
  emissionId: string;
  type: 'BEFORE_APPROVAL' | 'AFTER_FINALIZATION';
  snapshotData: {
    shareholders?: Array<{
      id: string;
      name: string;
      email: string;
      sharesOwned: number;
    }>;
  };
  totalShares: number;
  createdAt: string;
}

export interface EmissionAuditLog {
  id: string;
  emissionId: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'FINALIZE' | 'APPROVE_SUBSCRIPTION' | 'REJECT_SUBSCRIPTION';
  changes?: Record<string, unknown>;
  metadata?: {
    userName?: string;
    [key: string]: unknown;
  };
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}