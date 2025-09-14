import { apiClient } from '@/lib/apiClient';

// Enhanced Emission type with all necessary fields
export interface Emission {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  newSharesOffered: number;
  pricePerShare: number;
  totalValue: number; // Calculated: newSharesOffered * pricePerShare
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'FUNDED' | 'CANCELLED';
  currentSubscriptions?: number;
  targetAmount?: number;
  raisedAmount?: number;
  minimumInvestment?: number;
  createdAt: string;
  updatedAt: string;
  projectDetails?: {
    location?: string;
    propertyType?: string;
    expectedReturn?: number;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

// Create emission payload (omits generated fields)
export type CreateEmissionPayload = Omit<
  Emission,
  'id' | 'totalValue' | 'createdAt' | 'updatedAt' | 'currentSubscriptions' | 'raisedAmount'
>;

// Update emission payload (partial fields)
export type UpdateEmissionPayload = Partial<CreateEmissionPayload>;

// Investment subscription type
export interface Investment {
  id: string;
  emissionId: string;
  userId: string;
  numberOfShares: number;
  investmentAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

// Statistics interface
export interface EmissionStats {
  totalEmissions: number;
  activeEmissions: number;
  totalRaised: number;
  totalInvestors: number;
  averageInvestment?: number;
}

// Eligibility check response
export interface InvestmentEligibility {
  canInvest: boolean;
  reason?: string;
  minimumAmount?: number;
  maximumAmount?: number;
  remainingShares?: number;
}

const ENDPOINTS = {
  emissions: '/api/emissions',
  stats: '/api/emissions/stats',
  eligibility: (id: string) => `/api/emissions/${id}/eligibility`,
} as const;

/**
 * Get all emissions with optional filtering
 */
export async function getAllEmissions(params?: {
  status?: Emission['status'];
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'title' | 'startDate' | 'pricePerShare' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}): Promise<Emission[]> {
  return apiClient.fetchList<Emission>(ENDPOINTS.emissions, params);
}

/**
 * Get active emissions only
 */
export async function getActiveEmissions(): Promise<Emission[]> {
  return apiClient.fetchList<Emission>(ENDPOINTS.emissions, { status: 'ACTIVE' });
}

/**
 * Get emission by ID
 */
export async function getEmissionById(id: string): Promise<Emission> {
  return apiClient.fetchOne<Emission>(ENDPOINTS.emissions, id);
}

/**
 * Create new emission
 */
export async function createEmission(payload: CreateEmissionPayload): Promise<Emission> {
  // Calculate total value before sending
  const enhancedPayload = {
    ...payload,
    totalValue: payload.newSharesOffered * payload.pricePerShare,
  };

  return apiClient.create<Emission, typeof enhancedPayload>(ENDPOINTS.emissions, enhancedPayload);
}

/**
 * Update existing emission
 */
export async function updateEmission(
  id: string,
  payload: UpdateEmissionPayload
): Promise<Emission> {
  // If updating shares or price, we need to recalculate total value
  let enhancedPayload = { ...payload };

  if (payload.newSharesOffered !== undefined || payload.pricePerShare !== undefined) {
    // Get current emission to fill in missing values
    const current = await getEmissionById(id);
    const shares = payload.newSharesOffered ?? current.newSharesOffered;
    const price = payload.pricePerShare ?? current.pricePerShare;
    enhancedPayload = {
      ...enhancedPayload,
      totalValue: shares * price,
    };
  }

  return apiClient.update<Emission, typeof enhancedPayload>(ENDPOINTS.emissions, id, enhancedPayload);
}

/**
 * Partial update for emission status or single fields
 */
export async function patchEmission(
  id: string,
  payload: Partial<Emission>
): Promise<Emission> {
  return apiClient.partialUpdate<Emission, typeof payload>(ENDPOINTS.emissions, id, payload);
}

/**
 * Delete emission
 */
export async function deleteEmission(id: string): Promise<void> {
  return apiClient.remove<void>(ENDPOINTS.emissions, id);
}

/**
 * Get emission statistics
 */
export async function getEmissionStats(): Promise<EmissionStats> {
  return apiClient.get<EmissionStats>(ENDPOINTS.stats);
}

/**
 * Check if user can invest in emission
 */
export async function checkInvestmentEligibility(
  emissionId: string,
  userId?: string
): Promise<InvestmentEligibility> {
  const params = userId ? { userId } : undefined;
  return apiClient.get<InvestmentEligibility>(
    ENDPOINTS.eligibility(emissionId),
    { params }
  );
}

/**
 * Search emissions by text query
 */
export async function searchEmissions(
  query: string,
  filters?: {
    status?: Emission['status'];
    priceMin?: number;
    priceMax?: number;
    limit?: number;
  }
): Promise<Emission[]> {
  const params = {
    search: query,
    ...filters,
  };

  return apiClient.fetchList<Emission>(ENDPOINTS.emissions, params);
}

/**
 * Get emissions by status with pagination
 */
export async function getEmissionsByStatus(
  status: Emission['status'],
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<{
  emissions: Emission[];
  total: number;
  hasMore: boolean;
}> {
  const params = {
    status,
    ...options,
  };

  // Assume the API returns paginated results
  const response = await apiClient.get<{
    data: Emission[];
    meta: { total: number; limit: number; offset: number };
  }>(`${ENDPOINTS.emissions}/paginated`, { params });

  return {
    emissions: response.data,
    total: response.meta.total,
    hasMore: response.meta.offset + response.data.length < response.meta.total,
  };
}

/**
 * Bulk update emission statuses
 */
export async function bulkUpdateEmissions(
  updates: Array<{
    id: string;
    status: Emission['status'];
  }>
): Promise<Emission[]> {
  return apiClient.post<Emission[], typeof updates>(`${ENDPOINTS.emissions}/bulk-update`, updates);
}

/**
 * Get upcoming emission deadlines
 */
export async function getUpcomingDeadlines(
  days: number = 7
): Promise<Array<{
  emission: Emission;
  daysUntilEnd: number;
  urgency: 'low' | 'medium' | 'high';
}>> {
  return apiClient.get(`${ENDPOINTS.emissions}/upcoming-deadlines`, {
    params: { days }
  });
}

// Export types for external use
export type {
  CreateEmissionPayload,
  UpdateEmissionPayload,
  Investment,
  EmissionStats,
  InvestmentEligibility,
};