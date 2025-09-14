import { FiArrowUp, FiArrowDown, FiMinus } from 'react-icons/fi';
import { useNorwegianNumber } from '@/hooks/useNorwegianFormat';
import type { ShareholderSnapshot, ShareholderData } from './types';

interface SnapshotComparisonProps {
  beforeSnapshot: ShareholderSnapshot;
  afterSnapshot: ShareholderSnapshot;
}

export default function SnapshotComparison({ 
  beforeSnapshot, 
  afterSnapshot 
}: SnapshotComparisonProps) {
  const { formatNumber } = useNorwegianNumber();

  // Create maps for easy lookup
  const beforeMap = new Map<string, ShareholderData>();
  const afterMap = new Map<string, ShareholderData>();

  beforeSnapshot.snapshotData?.shareholders?.forEach(sh => {
    beforeMap.set(sh.id, sh);
  });

  afterSnapshot.snapshotData?.shareholders?.forEach(sh => {
    afterMap.set(sh.id, sh);
  });

  // Find all unique shareholder IDs
  const allIds = new Set([...beforeMap.keys(), ...afterMap.keys()]);

  // Calculate changes
  const changes = Array.from(allIds).map(id => {
    const before = beforeMap.get(id);
    const after = afterMap.get(id);

    return {
      id,
      name: after?.name || before?.name || 'Unknown',
      email: after?.email || before?.email || '',
      sharesBefore: before?.sharesOwned || 0,
      sharesAfter: after?.sharesOwned || 0,
      difference: (after?.sharesOwned || 0) - (before?.sharesOwned || 0),
      percentageBefore: before ? ((before.sharesOwned / beforeSnapshot.totalShares) * 100) : 0,
      percentageAfter: after ? ((after.sharesOwned / afterSnapshot.totalShares) * 100) : 0
    };
  });

  // Sort by absolute difference (biggest changes first)
  changes.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

  const getChangeIcon = (difference: number) => {
    if (difference > 0) return <FiArrowUp className="text-green-600 dark:text-green-400" size={16} />;
    if (difference < 0) return <FiArrowDown className="text-red-600 dark:text-red-400" size={16} />;
    return <FiMinus className="text-gray-400" size={16} />;
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Before Snapshot
          </h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatNumber(beforeSnapshot.totalShares)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {beforeSnapshot.snapshotData?.shareholderCount || 0} shareholders
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
            Change
          </h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-300">
            {afterSnapshot.totalShares > beforeSnapshot.totalShares ? '+' : ''}
            {formatNumber(afterSnapshot.totalShares - beforeSnapshot.totalShares)}
          </p>
          <p className="text-xs text-gray-700 dark:text-gray-400 mt-1">
            {((afterSnapshot.totalShares - beforeSnapshot.totalShares) / beforeSnapshot.totalShares * 100).toFixed(2)}% change
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            After Snapshot
          </h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatNumber(afterSnapshot.totalShares)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {afterSnapshot.snapshotData?.shareholderCount || 0} shareholders
          </p>
        </div>
      </div>

      {/* Changes Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Shareholder Changes
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Shareholder
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Before
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  After
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  % Before
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  % After
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {changes.map((change) => (
                <tr key={change.id} className={`hover:bg-muted/50 ${
                  change.difference !== 0 ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-card-foreground">
                      {change.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {change.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground text-right">
                    {formatNumber(change.sharesBefore)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground text-right">
                    {formatNumber(change.sharesAfter)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {getChangeIcon(change.difference)}
                      <span className={`text-sm font-medium ${
                        change.difference > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : change.difference < 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-gray-500'
                      }`}>
                        {change.difference > 0 ? '+' : ''}
                        {formatNumber(change.difference)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground text-right">
                    {change.percentageBefore.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground text-right">
                    {change.percentageAfter.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}