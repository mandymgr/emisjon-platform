// Samlet types for Emission-domenet – importeres av komponenter og services

export type EmissionStatus =
  | 'PREVIEW'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'FINALIZED'
  | 'DRAFT'
  | 'CLOSED'
  | 'FUNDED'
  | 'CANCELLED';

export interface EmissionUserLite {
  id: string;
  name?: string;
  email?: string;
}

export interface Emission {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  newSharesOffered: number;
  pricePerShare: number;
  totalValue?: number;
  status: EmissionStatus;
  sharesBefore?: number;
  sharesAfter?: number;
  isPreview?: boolean;
  presentationFileUrl?: string;
  finalizedAt?: string | null;
  finalizedBy?: EmissionUserLite | null;
  totalSharesSubscribed?: number;
  createdAt?: string;
}

export interface EmissionAuditLog {
  id: string;
  action:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'PUBLISH'
    | 'FINALIZE'
    | 'APPROVE_SUBSCRIPTION'
    | 'REJECT_SUBSCRIPTION'
    | string;
  user?: EmissionUserLite | null;
  createdAt: string; // ISO
  changes?: Record<string, unknown>;
  metadata?: Record<string, any>;
}

export interface SnapshotShareholder {
  id: string;
  name: string;
  email?: string;
  sharesOwned: number;
}

export interface ShareholderSnapshot {
  id: string;
  type: 'BEFORE_APPROVAL' | 'AFTER_FINALIZATION' | string;
  createdAt: string; // ISO
  totalShares: number;
  snapshotData?: {
    shareholders?: SnapshotShareholder[];
  };
}

export interface CreateEmissionDTO {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  newSharesOffered: number;
  pricePerShare: number;
  presentationFileUrl?: string;
}

export interface UpdateEmissionDTO {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  newSharesOffered?: number;
  pricePerShare?: number;
  presentationFileUrl?: string;
  status?: EmissionStatus;
}

// For SubscribeModal
export interface EmissionForSubscription {
  id: string;
  title: string;
  pricePerShare: number;
  newSharesOffered: number;
}