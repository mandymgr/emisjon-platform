import axiosInstance from '@/lib/axios';
import type { 
  Subscription, 
  CreateSubscriptionDTO, 
  UpdateSubscriptionDTO,
  ApproveSubscriptionDTO 
} from '@/types/subscription';

// Create a subscription
export async function createSubscription(data: CreateSubscriptionDTO): Promise<Subscription> {
  const response = await axiosInstance.post('/api/subscriptions', data);
  return response.data;
}

// Get user's own subscriptions
export async function getMySubscriptions(): Promise<Subscription[]> {
  const response = await axiosInstance.get('/api/subscriptions/my-subscriptions');
  return response.data;
}

// Get all subscriptions (Admin only)
export async function getAllSubscriptions(): Promise<Subscription[]> {
  const response = await axiosInstance.get('/api/subscriptions');
  return response.data;
}

// Get subscriptions for a specific emission (Admin only)
export async function getEmissionSubscriptions(emissionId: string): Promise<Subscription[]> {
  const response = await axiosInstance.get(`/api/subscriptions/emission/${emissionId}`);
  return response.data;
}

// Get subscriptions for a specific user (Admin only)
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  const response = await axiosInstance.get(`/api/subscriptions/user/${userId}`);
  return response.data;
}

// Update a subscription
export async function updateSubscription(
  id: string,
  data: UpdateSubscriptionDTO
): Promise<Subscription> {
  const response = await axiosInstance.put(`/api/subscriptions/${id}`, data);
  return response.data;
}

// Delete a subscription
export async function deleteSubscription(id: string): Promise<void> {
  await axiosInstance.delete(`/api/subscriptions/${id}`);
}

// Approve a subscription (Admin only)
export async function approveSubscription(
  id: string,
  data: ApproveSubscriptionDTO
): Promise<Subscription> {
  const response = await axiosInstance.post(`/api/subscriptions/${id}/approve`, data);
  return response.data;
}

// Reject a subscription (Admin only)
export async function rejectSubscription(id: string): Promise<Subscription> {
  const response = await axiosInstance.post(`/api/subscriptions/${id}/reject`);
  return response.data;
}