import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Shareholder } from './types';
import ShareholderTableRow from './ShareholderTableRow';
import { useAppSelector } from '@/store/hooks';

interface ShareholderTableWithSortProps {
  shareholders: Shareholder[];
  onDelete: (shareholder: Shareholder) => void;
  onEdit: (shareholder: Shareholder) => void;
}

type SortField = 'name' | 'email' | 'shares' | 'percentage' | null;
type SortDirection = 'asc' | 'desc';

function ShareholderTableWithSort({ 
  shareholders, 
  onDelete,
  onEdit
}: ShareholderTableWithSortProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const currentUser = useAppSelector(state => state.auth.user);
  const isAdmin = currentUser?.role === 'ADMIN';

  const handleSort = function(field: SortField) {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with ascending order
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedShareholders = [...shareholders].sort((a, b) => {
    if (!sortField) return 0;

    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle numeric comparison for shares and percentage
    if (sortField === 'shares' || sortField === 'percentage') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    } else {
      // String comparison for name and email
      aValue = aValue?.toLowerCase() || '';
      bValue = bValue?.toLowerCase() || '';
    }

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const SortIcon = function({ field }: { field: SortField }) {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 text-gray-600 dark:text-gray-300" />
      : <ArrowDown className="ml-2 h-4 w-4 text-gray-600 dark:text-gray-300" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left whitespace-nowrap">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                >
                  Name
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="px-6 py-3 text-left whitespace-nowrap">
                <button
                  onClick={() => handleSort('email')}
                  className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                >
                  Email
                  <SortIcon field="email" />
                </button>
              </th>
              <th className="px-6 py-3 text-left whitespace-nowrap">
                <button
                  onClick={() => handleSort('shares')}
                  className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                >
                  Shares
                  <SortIcon field="shares" />
                </button>
              </th>
              <th className="px-6 py-3 text-left whitespace-nowrap">
                <button
                  onClick={() => handleSort('percentage')}
                  className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                >
                  Percentage
                  <SortIcon field="percentage" />
                </button>
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedShareholders.map((shareholder) => (
              <ShareholderTableRow
                key={shareholder.id}
                shareholder={shareholder}
                onDelete={onDelete}
                onEdit={onEdit}
                isAdmin={isAdmin}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ShareholderTableWithSort;