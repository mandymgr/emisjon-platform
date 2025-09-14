import axiosInstance from '@/lib/axios';
import type { ShareholderSnapshot } from '@/components/shareholderSnapshot/types';

const API_URL = '/api';

// Get all snapshots
export const getAllSnapshots = async (): Promise<ShareholderSnapshot[]> => {
  const response = await axiosInstance.get(`${API_URL}/snapshots`);
  return response.data;
};

// Get snapshots for a specific emission
export const getEmissionSnapshots = async (emissionId: string): Promise<ShareholderSnapshot[]> => {
  const response = await axiosInstance.get(`${API_URL}/emissions/${emissionId}/snapshots`);
  return response.data;
};

// Get a specific snapshot
export const getSnapshot = async (snapshotId: string): Promise<ShareholderSnapshot> => {
  const response = await axiosInstance.get(`${API_URL}/snapshots/${snapshotId}`);
  return response.data;
};

// Create a manual snapshot
export const createManualSnapshot = async (emissionId: string): Promise<ShareholderSnapshot> => {
  const response = await axiosInstance.post(`${API_URL}/emissions/${emissionId}/snapshots`, {
    type: 'MANUAL',
    reason: 'Manual snapshot created by admin'
  });
  return response.data;
};

// Compare two snapshots
export const compareSnapshots = async (beforeId: string, afterId: string): Promise<any> => {
  const response = await axiosInstance.get(`${API_URL}/snapshots/compare`, {
    params: { beforeId, afterId }
  });
  return response.data;
};