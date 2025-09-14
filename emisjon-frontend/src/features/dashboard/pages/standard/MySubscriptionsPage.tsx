import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { AccessRestrictedCard } from '@/components/dashboard';
import EditSubscriptionModal from '@/components/subscription/EditSubscriptionModal';
import * as subscriptionService from '@/services/subscriptionService';
import type { Subscription } from '@/types/subscription';
import { useNorwegianNumber } from '@/hooks/useNorwegianFormat';
import { getTextPreview } from '@/utils/htmlUtils';

export default function MySubscriptionsPage() {
  const { user } = useAppSelector(state => state.auth);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const { formatCurrency, formatNumber } = useNorwegianNumber();

  const canViewSubscriptions = user?.role === 'ADMIN' || (user?.role === 'USER' && user.level >= 3);

  useEffect(() => {
    if (canViewSubscriptions) {
      fetchSubscriptions();
    }
  }, [canViewSubscriptions]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getMySubscriptions();
      setSubscriptions(data);
      setError(null);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async (id: string, sharesRequested: number) => {
    try {
      await subscriptionService.updateSubscription(id, { sharesRequested });
      fetchSubscriptions();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to update subscription');
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    
    try {
      await subscriptionService.deleteSubscription(id);
      fetchSubscriptions();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to delete subscription');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      APPROVED: 'border border-gray-400 text-gray-700 bg-white dark:border-gray-500 dark:text-gray-300 dark:bg-gray-800',
      REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status}
      </span>
    );
  };

  if (!canViewSubscriptions) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">My Subscriptions</h2>
        </div>
        <AccessRestrictedCard 
          requiredLevel={3}
          message="Subscriptions require Level 3+ access."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="bg-card rounded-lg shadow-md border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {[...Array(6)].map((_, i) => (
                    <th key={i} className="px-6 py-3">
                      <Skeleton className="h-4 w-20" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    {[...Array(6)].map((_, i) => (
                      <td key={i} className="px-6 py-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">My Subscriptions</h2>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
        {subscriptions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-muted-foreground">No subscriptions found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Emission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Allocated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-card-foreground">
                          {subscription.emission?.title || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {subscription.emission?.description ? getTextPreview(subscription.emission.description, 50) : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-card-foreground">
                        {formatNumber(subscription.sharesRequested)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-card-foreground">
                        {subscription.sharesAllocated 
                          ? formatNumber(subscription.sharesAllocated)
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-card-foreground">
                        {subscription.emission?.pricePerShare 
                          ? formatCurrency(subscription.sharesRequested * subscription.emission.pricePerShare)
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(subscription.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-card-foreground">
                        {new Date(subscription.createdAt).toLocaleDateString('nb-NO')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {subscription.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => setEditingSubscription(subscription)}
                              className="px-3 py-1 text-sm font-medium text-primary hover:text-primary/80 dark:text-white dark:hover:text-gray-300 bg-primary/10 hover:bg-primary/20 dark:bg-gray-700 dark:hover:bg-gray-600 rounded cursor-pointer transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSubscription(subscription.id)}
                              className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditSubscriptionModal
        isOpen={!!editingSubscription}
        subscription={editingSubscription}
        onSave={(sharesRequested) => {
          if (editingSubscription) {
            handleUpdateSubscription(editingSubscription.id, sharesRequested);
            setEditingSubscription(null);
          }
        }}
        onClose={() => setEditingSubscription(null)}
      />
    </div>
  );
}