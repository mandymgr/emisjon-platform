import React, { useEffect } from 'react';
import { Navigate } from 'react-router';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { checkAuth } from '@/features/auth/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isCheckingAuth } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Always check auth status on mount if not authenticated
    // The backend will check for the HTTP-only cookie
    if (!isAuthenticated && isCheckingAuth) {
      dispatch(checkAuth());
    }
  }, [dispatch, isAuthenticated, isCheckingAuth]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/minimal-login" replace />;
  }

  return <>{children}</>;
}