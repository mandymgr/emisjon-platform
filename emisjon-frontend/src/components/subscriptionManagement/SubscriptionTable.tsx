import type { Subscription } from '@/types/subscription';
import { useNorwegianNumber } from '@/hooks/useNorwegianFormat';
import SubscriptionStatusBadge from './SubscriptionStatusBadge';
import SubscriptionActions from './SubscriptionActions';

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function SubscriptionTable({ 
  subscriptions, 
  onApprove, 
  onReject 
}: SubscriptionTableProps) {
  const { formatCurrency, formatNumber } = useNorwegianNumber();

  if (subscriptions.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-muted-foreground">No subscriptions found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Emission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Current Shares
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Requested
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Allocated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Amount
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
                      {subscription.user?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {subscription.user?.email || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-card-foreground">
                      {subscription.emission?.title || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {subscription.emission?.pricePerShare 
                        ? formatCurrency(subscription.emission.pricePerShare) + ' per share'
                        : 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-card-foreground">
                    {subscription.user?.shareholder?.sharesOwned 
                      ? formatNumber(subscription.user.shareholder.sharesOwned)
                      : '0'}
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
                      ? formatNumber(subscription.sharesRequested * subscription.emission.pricePerShare)
                      : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <SubscriptionStatusBadge status={subscription.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-card-foreground">
                    {new Date(subscription.createdAt).toLocaleDateString('nb-NO')}
                  </div>
                  {subscription.approvedAt && (
                    <div className="text-xs text-muted-foreground">
                      Processed: {new Date(subscription.approvedAt).toLocaleDateString('nb-NO')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <SubscriptionActions
                    subscription={subscription}
                    onApprove={onApprove}
                    onReject={onReject}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}