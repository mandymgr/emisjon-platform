import axiosInstance from '@/lib/axios';
import type { AuthResponse, User } from '../types';
import type { LoginFormData, RegisterFormData } from '../schemas/authSchemas';

class AuthService {
  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/api/auth/login', data);
    // Cookie is set by the backend automatically
    return response.data;
  }

  async register(data: RegisterFormData): Promise<AuthResponse> {
    const { confirmPassword, agreedToTerms, ...registerData } = data;
    const response = await axiosInstance.post<AuthResponse>('/api/auth/register', registerData);
    // Cookie is set by the backend automatically
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get<{ user: User }>('/api/auth/me');
    return response.data.user;
  }

  async logout(): Promise<void> {
    await axiosInstance.post('/api/auth/logout');
    // Cookie is cleared by the backend automatically
  }

  async checkAuth(): Promise<AuthResponse> {
    const response = await axiosInstance.get<AuthResponse>('/api/auth/check');
    return response.data;
  }
}

export default new AuthService();