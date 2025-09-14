import { useNorwegianNumber } from '@/hooks/useNorwegianFormat';
import type { ShareholderSnapshot } from './types';

interface SnapshotDetailsTableProps {
  snapshot: ShareholderSnapshot;
  showPercentages?: boolean;
}

export default function SnapshotDetailsTable({ 
  snapshot, 
  showPercentages = true 
}: SnapshotDetailsTableProps) {
  const { formatNumber } = useNorwegianNumber();
  
  const shareholders = snapshot.snapshotData?.shareholders || [];
  const totalShares = snapshot.totalShares;

  if (shareholders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No shareholder data available in this snapshot
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Shareholder
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Email
            </th>
            {snapshot.snapshotData?.shareholders?.[0]?.phone !== undefined && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Phone
              </th>
            )}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Shares Owned
            </th>
            {showPercentages && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ownership %
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {shareholders.map((shareholder, index) => {
            const percentage = totalShares > 0 
              ? ((shareholder.sharesOwned / totalShares) * 100).toFixed(2)
              : '0.00';
            
            return (
              <tr key={shareholder.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-card-foreground">
                    {shareholder.name}
                  </div>
                  {shareholder.userId && (
                    <div className="text-xs text-muted-foreground">
                      System User
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                  {shareholder.email}
                </td>
                {snapshot.snapshotData?.shareholders?.[0]?.phone !== undefined && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                    {shareholder.phone || '-'}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground text-right">
                  {formatNumber(shareholder.sharesOwned)}
                </td>
                {showPercentages && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${parseFloat(percentage) >= 10 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-white' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white'}
                    `}>
                      {shareholder.ownershipPercentage 
                        ? `${shareholder.ownershipPercentage}%`
                        : `${percentage}%`}
                    </span>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <td colSpan={snapshot.snapshotData?.shareholders?.[0]?.phone !== undefined ? 4 : 3} 
                className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
              Total
            </td>
            <td className="px-6 py-3 text-right text-sm font-bold text-gray-900 dark:text-gray-100">
              {formatNumber(totalShares)}
            </td>
            {showPercentages && (
              <td className="px-6 py-3 text-right text-sm font-bold text-gray-900 dark:text-gray-100">
                100.00%
              </td>
            )}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}