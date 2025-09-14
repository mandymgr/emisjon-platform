import axiosInstance from '@/lib/axios';
import type { User, CreateUserDTO, UpdateUserDTO } from '@/components/user/types';

const API_URL = '/api/users';

export type { User, CreateUserDTO, UpdateUserDTO };

// Get all users (admin level 2 only)
export async function getAllUsers(): Promise<User[]> {
  const response = await axiosInstance.get(API_URL);
  return response.data;
}

// Update user (admin level 2 only)
export async function updateUser(id: string, data: UpdateUserDTO): Promise<User> {
  // Filter out empty phone field to avoid validation errors
  const payload: any = {};
  
  if (data.name !== undefined) payload.name = data.name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.password !== undefined && data.password !== '') payload.password = data.password;
  if (data.phone !== undefined && data.phone.trim() !== '') payload.phone = data.phone;
  if (data.role !== undefined) payload.role = data.role;
  if (data.level !== undefined) payload.level = data.level;
  
  const response = await axiosInstance.put(`${API_URL}/${id}`, payload);
  return response.data;
}

// Delete user (admin level 2 only)
export async function deleteUser(id: string): Promise<void> {
  await axiosInstance.delete(`${API_URL}/${id}`);
}

// Create new user (admin level 2 only)
export async function createUser(data: CreateUserDTO): Promise<User> {
  // Remove phone field if it's empty to avoid validation errors
  const payload: any = {
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
    level: data.level
  };
  
  // Only include phone if it has a value
  if (data.phone && data.phone.trim() !== '') {
    payload.phone = data.phone;
  }
  
  const response = await axiosInstance.post(API_URL, payload);
  return response.data;
}