import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import * as subscriptionService from '@/services/subscriptionService';
import type { Subscription } from '@/types/subscription';
import SubscriptionFilters from '@/components/subscriptionManagement/SubscriptionFilters';
import SubscriptionTable from '@/components/subscriptionManagement/SubscriptionTable';
import SubscriptionTableSkeleton from '@/components/subscriptionManagement/SubscriptionTableSkeleton';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ApproveSubscriptionModal from '@/components/subscriptionManagement/ApproveSubscriptionModal';

export default function SubscriptionManagementPage() {
  const { user } = useAppSelector(state => state.auth);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [subscriptionToReject, setSubscriptionToReject] = useState<string | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [subscriptionToApprove, setSubscriptionToApprove] = useState<Subscription | null>(null);

  const isAdminLevel2 = user?.role === 'ADMIN' && user?.level === 2;

  useEffect(() => {
    if (isAdminLevel2) {
      fetchSubscriptions();
    }
  }, [isAdminLevel2]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getAllSubscriptions();
      setSubscriptions(data);
      setError(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id: string) => {
    const subscription = subscriptions.find(s => s.id === id);
    if (subscription) {
      setSubscriptionToApprove(subscription);
      setApproveModalOpen(true);
    }
  };

  const confirmApprove = async (sharesAllocated: number) => {
    if (!subscriptionToApprove) return;

    try {
      await subscriptionService.approveSubscription(subscriptionToApprove.id, { sharesAllocated });
      fetchSubscriptions();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to approve subscription');
    } finally {
      setSubscriptionToApprove(null);
      setApproveModalOpen(false);
    }
  };

  const handleReject = (id: string) => {
    setSubscriptionToReject(id);
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!subscriptionToReject) return;

    try {
      await subscriptionService.rejectSubscription(subscriptionToReject);
      fetchSubscriptions();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to reject subscription');
    } finally {
      setSubscriptionToReject(null);
    }
  };

  const filteredSubscriptions = filter === 'ALL' 
    ? subscriptions 
    : subscriptions.filter(s => s.status === filter);

  const subscriptionCounts = {
    all: subscriptions.length,
    pending: subscriptions.filter(s => s.status === 'PENDING').length,
    approved: subscriptions.filter(s => s.status === 'APPROVED').length,
    rejected: subscriptions.filter(s => s.status === 'REJECTED').length,
  };

  if (!isAdminLevel2) {
    return (
      <div className="bg-card rounded-lg shadow-md border border-border p-6">
        <h2 className="text-xl font-bold text-card-foreground">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          You need Admin Level 2 access to manage subscriptions.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Subscription Management</h2>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div>
          <div className="mb-4">
            <Skeleton className="h-10 w-80" />
          </div>
          <SubscriptionTableSkeleton />
        </div>
      ) : (
        <>
          <SubscriptionFilters
            filter={filter}
            onFilterChange={setFilter}
            subscriptionCounts={subscriptionCounts}
          />
          <SubscriptionTable
            subscriptions={filteredSubscriptions}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </>
      )}

      <ConfirmationModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSubscriptionToReject(null);
        }}
        onConfirm={confirmReject}
        title="Reject Subscription"
        message="Are you sure you want to reject this subscription? This action cannot be undone."
        confirmText="Reject"
        cancelText="Cancel"
        type="danger"
      />

      <ApproveSubscriptionModal
        isOpen={approveModalOpen}
        subscription={subscriptionToApprove ? {
          sharesRequested: subscriptionToApprove.sharesRequested,
          userName: subscriptionToApprove.user?.name,
          emissionTitle: subscriptionToApprove.emission?.title
        } : null}
        onClose={() => {
          setApproveModalOpen(false);
          setSubscriptionToApprove(null);
        }}
        onApprove={confirmApprove}
      />
    </div>
  );
}