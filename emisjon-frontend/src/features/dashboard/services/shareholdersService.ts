import axiosInstance from '@/lib/axios';
import type { Shareholder, CreateShareholderDTO, UpdateShareholderDTO } from '@/components/shareholder/types';

const API_URL = '/api/shareholders';

export interface ShareholderStats {
  totalShareholders: number;
  totalShares: number;
  totalValue: number;
}

export interface ShareholderBackend {
  id: string;
  name: string;
  email: string;
  sharesOwned: number;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Transform backend shareholder to frontend format
function transformShareholder(shareholder: ShareholderBackend, totalShares: number): Shareholder {
  return {
    id: shareholder.id,
    name: shareholder.name,
    email: shareholder.email,
    shares: shareholder.sharesOwned,
    percentage: totalShares > 0 ? Math.round((shareholder.sharesOwned / totalShares) * 100 * 10) / 10 : 0,
    value: shareholder.sharesOwned * 100, // Assuming $100 per share - adjust as needed
    change: 0, // This would come from historical data in a real app
    joinedAt: shareholder.createdAt,
    userId: shareholder.userId || undefined
  };
}

// Get all shareholders
export async function getAllShareholders(): Promise<Shareholder[]> {
  const response = await axiosInstance.get<ShareholderBackend[]>(API_URL);
  
  // Calculate total shares for percentage
  const totalShares = response.data.reduce((sum, sh) => sum + sh.sharesOwned, 0);
  
  return response.data.map(sh => transformShareholder(sh, totalShares));
}

// Get shareholder statistics
export async function getShareholderStats(): Promise<ShareholderStats> {
  const response = await axiosInstance.get<ShareholderStats>(`${API_URL}/stats`);
  return response.data;
}

// Get shareholder by ID
export async function getShareholderById(id: string): Promise<Shareholder> {
  const response = await axiosInstance.get<ShareholderBackend>(`${API_URL}/${id}`);
  
  // For single shareholder, we need to get total shares
  const allResponse = await axiosInstance.get<ShareholderBackend[]>(API_URL);
  const totalShares = allResponse.data.reduce((sum, sh) => sum + sh.sharesOwned, 0);
  
  return transformShareholder(response.data, totalShares);
}

// Create new shareholder (admin only)
export async function createShareholder(data: CreateShareholderDTO): Promise<Shareholder> {
  const payload: any = {
    name: data.name,
    email: data.email,
    sharesOwned: data.shares
  };
  
  // Only include optional fields if they have values
  if (data.phone && data.phone.trim() !== '') {
    payload.phone = data.phone;
  }
  if (data.userId) {
    payload.userId = data.userId;
  }
  
  const response = await axiosInstance.post<ShareholderBackend>(API_URL, payload);
  
  // Get updated total shares
  const allResponse = await axiosInstance.get<ShareholderBackend[]>(API_URL);
  const totalShares = allResponse.data.reduce((sum, sh) => sum + sh.sharesOwned, 0);
  
  return transformShareholder(response.data, totalShares);
}

// Update shareholder (admin only)
export async function updateShareholder(id: string, data: UpdateShareholderDTO): Promise<Shareholder> {
  const payload: any = {};
  
  if (data.name) payload.name = data.name;
  if (data.email) payload.email = data.email;
  if (data.phone && data.phone.trim() !== '') payload.phone = data.phone;
  if (data.shares !== undefined) payload.sharesOwned = data.shares;
  
  const response = await axiosInstance.put<ShareholderBackend>(`${API_URL}/${id}`, payload);
  
  // Get updated total shares
  const allResponse = await axiosInstance.get<ShareholderBackend[]>(API_URL);
  const totalShares = allResponse.data.reduce((sum, sh) => sum + sh.sharesOwned, 0);
  
  return transformShareholder(response.data, totalShares);
}

// Delete shareholder (admin only)
export async function deleteShareholder(id: string): Promise<void> {
  await axiosInstance.delete(`${API_URL}/${id}`);
}

export type { Shareholder, CreateShareholderDTO, UpdateShareholderDTO };