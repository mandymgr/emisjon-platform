export interface Subscription {
  id: string;
  emissionId: string;
  userId: string;
  sharesRequested: number;
  sharesAllocated?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedById?: string;
  approvedAt?: string;
  createdAt: string;
  emission?: {
    id: string;
    title: string;
    description: string;
    pricePerShare: number;
    newSharesOffered: number;
    status: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    shareholder?: {
      id: string;
      sharesOwned: number;
    };
  };
}

export interface CreateSubscriptionDTO {
  emissionId: string;
  sharesRequested: number;
}

export interface UpdateSubscriptionDTO {
  sharesRequested: number;
}

export interface ApproveSubscriptionDTO {
  sharesAllocated: number;
}