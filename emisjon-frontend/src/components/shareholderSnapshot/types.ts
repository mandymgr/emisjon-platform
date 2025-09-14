export interface ShareholderData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  sharesOwned: number;
  ownershipPercentage?: number;
  userId?: string;
}

export interface ShareholderSnapshot {
  id: string;
  emissionId: string;
  type: 'BEFORE_APPROVAL' | 'AFTER_FINALIZATION' | 'MANUAL' | 'SYSTEM';
  snapshotReason: string;
  totalSharesBefore: number;
  totalShares: number;
  snapshotData: {
    shareholders?: ShareholderData[];
    timestamp?: string;
    shareholderCount?: number;
  };
  createdById?: string;
  createdAt: string;
  emission?: {
    id: string;
    title: string;
    status: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SnapshotComparison {
  before: ShareholderSnapshot;
  after: ShareholderSnapshot;
  changes: {
    shareholderId: string;
    name: string;
    sharesBefore: number;
    sharesAfter: number;
    difference: number;
    percentageBefore: number;
    percentageAfter: number;
  }[];
}