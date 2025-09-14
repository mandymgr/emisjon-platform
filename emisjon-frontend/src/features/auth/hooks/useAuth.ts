import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import authService from '../services/authService';
import type { User } from '../types';
import type { LoginFormData, RegisterFormData } from '../schemas/authSchemas';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Failed to get current user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await authService.login(data);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/dashboard');
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (data: RegisterFormData) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await authService.register(data);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/dashboard');
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!localStorage.getItem('token')
  };
};