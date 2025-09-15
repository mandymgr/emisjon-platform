import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const DashboardLayout = lazy(() => import('@/features/dashboard/components/DashboardLayout'));

// Standard dashboard pages
const DashboardHome = lazy(() => import('@/features/dashboard/pages/standard/DashboardHome'));
const UsersPage = lazy(() => import('@/features/dashboard/pages/standard/UsersPage'));
const ShareholdersPage = lazy(() => import('@/features/dashboard/pages/standard/ShareholdersPage'));
const EmissionsPage = lazy(() => import('@/features/dashboard/pages/standard/EmissionsPage'));
const MySubscriptionsPage = lazy(() => import('@/features/dashboard/pages/standard/MySubscriptionsPage'));
const SubscriptionManagementPage = lazy(() => import('@/features/dashboard/pages/standard/SubscriptionManagementPage'));
const ShareholderSnapshotsPage = lazy(() => import('@/features/dashboard/pages/standard/ShareholderSnapshotsPage'));
const TradingPage = lazy(() => import('@/features/dashboard/pages/standard/TradingPage'));

// Minimal dashboard pages
const MinimalDashboardHome = lazy(() => import('@/features/dashboard/pages/minimal/MinimalDashboardHome'));
const MinimalDashboardHomeKinfolk = lazy(() => import('@/features/dashboard/pages/minimal/MinimalDashboardHomeKinfolk'));
const MinimalUsersPage = lazy(() => import('@/features/dashboard/pages/minimal/MinimalUsersPage'));
const MinimalShareholdersPage = lazy(() => import('@/features/dashboard/pages/minimal/MinimalShareholdersPage'));
const MinimalShareholderSnapshotsPage = lazy(() => import('@/features/dashboard/pages/minimal/MinimalShareholderSnapshotsPage'));
const MinimalEmissionsPage = lazy(() => import('@/features/dashboard/pages/minimal/MinimalEmissionsPage'));
const MinimalMySubscriptionsPage = lazy(() => import('@/features/dashboard/pages/minimal/MinimalMySubscriptionsPage'));
const MinimalSubscriptionManagementPage = lazy(() => import('@/features/dashboard/pages/minimal/MinimalSubscriptionManagementPage'));
const MinimalTradingPage = lazy(() => import('@/features/dashboard/pages/minimal/MinimalTradingPage'));

// Auth and other pages
const MinimalLoginPage = lazy(() => import('@/features/auth/pages/MinimalLoginPage'));
const MinimalRegisterPage = lazy(() => import('@/features/auth/pages/MinimalRegisterPage'));
const MinimalDashboardLayout = lazy(() => import('@/features/dashboard/components/MinimalDashboardLayout'));
const DesignShowcase = lazy(() => import('./DesignShowcase'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/minimal-login" replace />} />
          <Route path="/login" element={<MinimalLoginPage />} />
          <Route path="/register" element={<MinimalRegisterPage />} />
          <Route path="/design" element={<DesignShowcase />} />
          <Route path="/minimal-login" element={<MinimalLoginPage />} />
          <Route path="/minimal-register" element={<MinimalRegisterPage />} />
          <Route path="/old-login" element={<LoginPage />} />
          <Route path="/old-register" element={<RegisterPage />} />

          {/* Protected minimal dashboard routes */}
          <Route path="/minimal-dashboard" element={
            <ProtectedRoute>
              <MinimalDashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<MinimalDashboardHome />} />
            <Route path="kinfolk" element={<MinimalDashboardHomeKinfolk />} />
            <Route path="users" element={<MinimalUsersPage />} />
            <Route path="shareholders" element={<MinimalShareholdersPage />} />
            <Route path="snapshots" element={<MinimalShareholderSnapshotsPage />} />
            <Route path="emissions" element={<MinimalEmissionsPage />} />
            <Route path="my-subscriptions" element={<MinimalMySubscriptionsPage />} />
            <Route path="subscriptions" element={<MinimalSubscriptionManagementPage />} />
            <Route path="trading" element={<MinimalTradingPage />} />
          </Route>

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="shareholders" element={<ShareholdersPage />} />
            <Route path="snapshots" element={<ShareholderSnapshotsPage />} />
            <Route path="emissions" element={<EmissionsPage />} />
            <Route path="my-subscriptions" element={<MySubscriptionsPage />} />
            <Route path="subscriptions" element={<SubscriptionManagementPage />} />
            <Route path="trading" element={<TradingPage />} />
          </Route>
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/minimal-dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}