interface SubscriptionStatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function SubscriptionStatusBadge({ status }: SubscriptionStatusBadgeProps) {
  const statusStyles = {
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    APPROVED: 'border border-gray-400 text-gray-700 bg-white dark:border-gray-500 dark:text-gray-300 dark:bg-gray-800',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
      {status}
    </span>
  );
}