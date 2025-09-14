import { FiCheck, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import type { Subscription } from '@/types/subscription';

interface SubscriptionActionsProps {
  subscription: Subscription;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function SubscriptionActions({ 
  subscription, 
  onApprove, 
  onReject 
}: SubscriptionActionsProps) {
  if (subscription.status !== 'PENDING') {
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <div className="flex items-center justify-end space-x-2">
      <Button
        onClick={() => onApprove(subscription.id)}
        size="sm"
        variant="ghost"
        className="flex items-center gap-1 border border-gray-400 text-gray-700 hover:bg-gray-100 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
        title="Approve subscription"
      >
        <FiCheck size={16} />
        <span className="text-xs font-medium">Approve</span>
      </Button>
      <Button
        onClick={() => onReject(subscription.id)}
        size="sm"
        variant="ghost"
        className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
        title="Reject subscription"
      >
        <FiX size={16} />
        <span className="text-xs font-medium">Reject</span>
      </Button>
    </div>
  );
}