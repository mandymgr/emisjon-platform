import { apiClient } from "./apiClient"; // Assuming you have an axios instance

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
  status: "DRAFT" | "ACTIVE" | "CLOSED" | "FUNDED" | "CANCELLED";
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
    riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  };
}

// Create emission payload (omits generated fields)
export type CreateEmissionPayload = Omit<
  Emission,
  "id" | "totalValue" | "createdAt" | "updatedAt" | "currentSubscriptions" | "raisedAmount"
>;

// Update emission payload (partial fields)
export type UpdateEmissionPayload = Partial<CreateEmissionPayload>;

// API response wrapper for better error handling
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Error type for consistent error handling
export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

const BASE_URL = "/api/emissions";

/**
 * Get all emissions with optional filtering
 */
export async function getAllEmissions(params?: {
  status?: Emission["status"];
  limit?: number;
  offset?: number;
}): Promise<Emission[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
    const response = await apiClient.get<Emission[]>(url);

    return response.data;
  } catch (error) {
    console.error("Failed to fetch emissions:", error);
    throw new ApiError({
      message: "Kunne ikke hente emisjoner. Prøv igjen senere.",
      details: error
    });
  }
}

/**
 * Get active emissions only
 */
export async function getActiveEmissions(): Promise<Emission[]> {
  return getAllEmissions({ status: "ACTIVE" });
}

/**
 * Get emission by ID
 */
export async function getEmissionById(id: string): Promise<Emission> {
  try {
    const response = await apiClient.get<Emission>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch emission ${id}:`, error);
    throw new ApiError({
      message: "Kunne ikke hente emisjon. Sjekk at ID-en er korrekt.",
      details: error
    });
  }
}

/**
 * Create new emission
 */
export async function createEmission(payload: CreateEmissionPayload): Promise<Emission> {
  try {
    // Calculate total value
    const enhancedPayload = {
      ...payload,
      totalValue: payload.newSharesOffered * payload.pricePerShare,
    };

    const response = await apiClient.post<Emission>(BASE_URL, enhancedPayload);
    return response.data;
  } catch (error) {
    console.error("Failed to create emission:", error);
    throw new ApiError({
      message: "Kunne ikke opprette emisjon. Kontroller data og prøv igjen.",
      details: error
    });
  }
}

/**
 * Update existing emission
 */
export async function updateEmission(
  id: string,
  payload: UpdateEmissionPayload
): Promise<Emission> {
  try {
    // Recalculate total value if price or shares changed
    const enhancedPayload = { ...payload };
    if (payload.newSharesOffered || payload.pricePerShare) {
      const current = await getEmissionById(id);
      const shares = payload.newSharesOffered ?? current.newSharesOffered;
      const price = payload.pricePerShare ?? current.pricePerShare;
      enhancedPayload.totalValue = shares * price;
    }

    const response = await apiClient.put<Emission>(`${BASE_URL}/${id}`, enhancedPayload);
    return response.data;
  } catch (error) {
    console.error(`Failed to update emission ${id}:`, error);
    throw new ApiError({
      message: "Kunne ikke oppdatere emisjon. Prøv igjen senere.",
      details: error
    });
  }
}

/**
 * Delete emission
 */
export async function deleteEmission(id: string): Promise<void> {
  try {
    await apiClient.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Failed to delete emission ${id}:`, error);
    throw new ApiError({
      message: "Kunne ikke slette emisjon. Prøv igjen senere.",
      details: error
    });
  }
}

/**
 * Get emission statistics
 */
export async function getEmissionStats(): Promise<{
  totalEmissions: number;
  activeEmissions: number;
  totalRaised: number;
  totalInvestors: number;
}> {
  try {
    const response = await apiClient.get(`${BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch emission stats:", error);
    throw new ApiError({
      message: "Kunne ikke hente emisjonstatistikk.",
      details: error
    });
  }
}

/**
 * Check if user can invest in emission
 */
export async function canInvestInEmission(
  emissionId: string,
  userId?: string
): Promise<{
  canInvest: boolean;
  reason?: string;
  minimumAmount?: number;
  maximumAmount?: number;
}> {
  try {
    const params = userId ? `?userId=${userId}` : "";
    const response = await apiClient.get(`${BASE_URL}/${emissionId}/eligibility${params}`);
    return response.data;
  } catch (error) {
    console.error("Failed to check investment eligibility:", error);
    throw new ApiError({
      message: "Kunne ikke sjekke investeringsrettigheter.",
      details: error
    });
  }
}

// Export error class for consistent error handling
export class ApiError extends Error {
  public status?: number;
  public details?: unknown;

  constructor({ message, status, details }: {
    message: string;
    status?: number;
    details?: unknown;
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}