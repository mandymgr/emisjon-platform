import { createContext, useContext, type ReactNode } from 'react';
import { useAppSelector } from '@/store/hooks';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  getUserLevel: () => string;
  hasAdminL2Access: () => boolean;
  hasAdminL1Access: () => boolean;
  hasUserL3Access: () => boolean;
  hasUserL2Access: () => boolean;
  hasUserL1Access: () => boolean;
  canTrade: () => boolean;
  canApprove: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAppSelector(state => state.auth);
  const isAuthenticated = !!user;

  const getUserLevel = () => {
    if (!user) return 'Guest';
    
    if (user.role === 'ADMIN') {
      return 'Admin';
    }
    
    switch (user.level) {
      case 3:
        return 'User L3';
      case 2:
        return 'User L2';
      case 1:
        return 'User L1';
      default:
        return 'User L1';
    }
  };

  const hasAdminL2Access = () => {
    return user?.role === 'ADMIN' && user?.level >= 2;
  };

  const hasAdminL1Access = () => {
    return user?.role === 'ADMIN' && user?.level >= 1;
  };

  const hasUserL3Access = () => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return user.level >= 3;
  };

  const hasUserL2Access = () => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return user.level >= 2;
  };

  const hasUserL1Access = () => {
    if (!user) return false;
    return true;
  };

  const canTrade = () => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return user.level >= 3;
  };

  const canApprove = () => {
    return hasAdminL2Access();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    getUserLevel,
    hasAdminL2Access,
    hasAdminL1Access,
    hasUserL3Access,
    hasUserL2Access,
    hasUserL1Access,
    canTrade,
    canApprove,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}