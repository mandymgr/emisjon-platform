import { FiFilter } from 'react-icons/fi';

interface SubscriptionFiltersProps {
  filter: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
  onFilterChange: (filter: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED') => void;
  subscriptionCounts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export default function SubscriptionFilters({ 
  filter, 
  onFilterChange,
  subscriptionCounts 
}: SubscriptionFiltersProps) {
  const filters: Array<{ value: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'; label: string; count: number }> = [
    { value: 'ALL', label: 'All', count: subscriptionCounts.all },
    { value: 'PENDING', label: 'Pending', count: subscriptionCounts.pending },
    { value: 'APPROVED', label: 'Approved', count: subscriptionCounts.approved },
    { value: 'REJECTED', label: 'Rejected', count: subscriptionCounts.rejected },
  ];

  return (
    <div className="flex items-center space-x-2 mb-4">
      <FiFilter className="text-muted-foreground" />
      <div className="flex space-x-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              filter === f.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>
    </div>
  );
}