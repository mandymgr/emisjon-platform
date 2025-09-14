import axiosInstance from '@/lib/axios';
import type { Emission, CreateEmissionData, UpdateEmissionData, ShareholderSnapshot, EmissionAuditLog } from '@/types/emission';

const API_URL = '/api/emissions';

// Get all emissions
export const getAllEmissions = async (): Promise<Emission[]> => {
  const response = await axiosInstance.get(API_URL);
  return response.data;
};

// Get emission by ID
export const getEmissionById = async (id: string): Promise<Emission> => {
  const response = await axiosInstance.get(`${API_URL}/${id}`);
  return response.data;
};

// Create new emission (Admin only)
export const createEmission = async (data: CreateEmissionData): Promise<Emission> => {
  // Check if we have a file to upload
  const hasFile = data.presentationFile instanceof File;
  
  if (hasFile) {
    // Use FormData for file upload
    const formData = new FormData();
    
    // Add all fields to FormData
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('sharesBefore', data.sharesBefore.toString());
    formData.append('newSharesOffered', data.newSharesOffered.toString());
    formData.append('pricePerShare', data.pricePerShare.toString());
    formData.append('startDate', data.startDate);
    formData.append('endDate', data.endDate);
    if (data.status) formData.append('status', data.status);
    if (data.scheduledDate) formData.append('scheduledDate', data.scheduledDate);
    if (data.isPreview !== undefined) formData.append('isPreview', data.isPreview.toString());
    
    // Add the file (we already checked it exists)
    if (data.presentationFile) {
      formData.append('presentationFile', data.presentationFile);
    }
    
    const response = await axiosInstance.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } else {
    // No file, send as JSON (excluding presentationFile field)
    const { presentationFile, ...jsonData } = data;
    const response = await axiosInstance.post(API_URL, jsonData);
    return response.data;
  }
};

// Update emission (Admin only)
export const updateEmission = async (id: string, data: UpdateEmissionData): Promise<Emission> => {
  // Check if we have a file to upload
  const hasFile = data.presentationFile instanceof File;
  
  if (hasFile) {
    // Use FormData for file upload
    const formData = new FormData();
    
    // Add all fields to FormData (only if they exist since it's an update)
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.sharesBefore !== undefined) formData.append('sharesBefore', data.sharesBefore.toString());
    if (data.newSharesOffered !== undefined) formData.append('newSharesOffered', data.newSharesOffered.toString());
    if (data.pricePerShare !== undefined) formData.append('pricePerShare', data.pricePerShare.toString());
    if (data.startDate) formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    if (data.status) formData.append('status', data.status);
    if (data.scheduledDate) formData.append('scheduledDate', data.scheduledDate);
    if (data.isPreview !== undefined) formData.append('isPreview', data.isPreview.toString());
    
    // Add the file (we already checked it exists)
    if (data.presentationFile) {
      formData.append('presentationFile', data.presentationFile);
    }
    
    const response = await axiosInstance.put(`${API_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } else {
    // No file, send as JSON (excluding presentationFile field)
    const { presentationFile, ...jsonData } = data;
    const response = await axiosInstance.put(`${API_URL}/${id}`, jsonData);
    return response.data;
  }
};

// Delete emission (Admin only, PREVIEW only)
export const deleteEmission = async (id: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(`${API_URL}/${id}`);
  return response.data;
};

// Activate emission (Admin only)
export const activateEmission = async (id: string): Promise<Emission> => {
  const response = await axiosInstance.post(`${API_URL}/${id}/activate`);
  return response.data;
};

// Complete emission (Admin only)
export const completeEmission = async (id: string): Promise<Emission> => {
  const response = await axiosInstance.post(`${API_URL}/${id}/complete`);
  return response.data;
};

// Set emission to preview mode (Admin only)
export const setPreviewMode = async (id: string, isPreview: boolean): Promise<Emission> => {
  const response = await axiosInstance.post(`${API_URL}/${id}/preview`, { isPreview });
  return response.data;
};

// Finalize emission (Admin Level 2 only)
export const finalizeEmission = async (id: string): Promise<Emission> => {
  const response = await axiosInstance.post(`${API_URL}/${id}/finalize`);
  return response.data;
};

// Get emission snapshots
export const getEmissionSnapshots = async (id: string): Promise<ShareholderSnapshot[]> => {
  const response = await axiosInstance.get(`${API_URL}/${id}/snapshots`);
  return response.data;
};

// Get emission audit logs
export const getEmissionAuditLogs = async (id: string): Promise<EmissionAuditLog[]> => {
  const response = await axiosInstance.get(`${API_URL}/${id}/audit-logs`);
  return response.data;
};