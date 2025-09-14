import type { Shareholder } from './types';
import ShareholderTableRow from './ShareholderTableRow';
import { useAppSelector } from '@/store/hooks';

interface ShareholderTableProps {
  shareholders: Shareholder[];
  onDelete: (shareholder: Shareholder) => void;
  onEdit: (shareholder: Shareholder) => void;
}

export default function ShareholderTable({ 
  shareholders, 
  onDelete,
  onEdit
}: ShareholderTableProps) {
  const currentUser = useAppSelector(state => state.auth.user);
  const isAdmin = currentUser?.role === 'ADMIN';
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Shares
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Percentage
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {shareholders.map((shareholder) => (
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