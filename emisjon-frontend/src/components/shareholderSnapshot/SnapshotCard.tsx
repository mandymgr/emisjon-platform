import { FiCalendar, FiUsers, FiPieChart, FiFileText } from 'react-icons/fi';
import type { ShareholderSnapshot } from './types';
import { useNorwegianNumber } from '@/hooks/useNorwegianFormat';

interface SnapshotCardProps {
  snapshot: ShareholderSnapshot;
  onClick?: () => void;
  isSelected?: boolean;
}

export default function SnapshotCard({ snapshot, onClick, isSelected = false }: SnapshotCardProps) {
  const { formatNumber } = useNorwegianNumber();

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      BEFORE_APPROVAL: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
      AFTER_FINALIZATION: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      MANUAL: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
      SYSTEM: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
    };

    const labels: Record<string, string> = {
      BEFORE_APPROVAL: 'Before Approval',
      AFTER_FINALIZATION: 'After Finalization',
      MANUAL: 'Manual',
      SYSTEM: 'System'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[type] || styles.SYSTEM}`}>
        {labels[type] || type}
      </span>
    );
  };

  const shareholderCount = snapshot.snapshotData?.shareholderCount || 
                          snapshot.snapshotData?.shareholders?.length || 0;

  return (
    <div
      onClick={onClick}
      className={`
        bg-card rounded-lg border p-4 transition-all
        ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/50' : ''}
        ${isSelected ? 'border-primary shadow-md' : 'border-border'}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getTypeBadge(snapshot.type)}
          {snapshot.emission && (
            <span className="text-xs text-muted-foreground">
              {snapshot.emission.title}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FiCalendar size={14} />
          <span>{new Date(snapshot.createdAt).toLocaleString('nb-NO')}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FiUsers size={12} />
              <span>Shareholders</span>
            </div>
            <p className="text-lg font-semibold text-card-foreground">
              {shareholderCount}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FiPieChart size={12} />
              <span>Total Shares</span>
            </div>
            <p className="text-lg font-semibold text-card-foreground">
              {formatNumber(snapshot.totalShares)}
            </p>
          </div>
        </div>

        {snapshot.totalSharesBefore && snapshot.totalSharesBefore !== snapshot.totalShares && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shares Before:</span>
              <span className="font-medium text-card-foreground">
                {formatNumber(snapshot.totalSharesBefore)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Change:</span>
              <span className={`font-medium ${
                snapshot.totalShares > snapshot.totalSharesBefore 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {snapshot.totalShares > snapshot.totalSharesBefore ? '+' : ''}
                {formatNumber(snapshot.totalShares - snapshot.totalSharesBefore)}
              </span>
            </div>
          </div>
        )}

        {snapshot.snapshotReason && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <FiFileText size={12} className="mt-0.5" />
            <span className="italic">{snapshot.snapshotReason}</span>
          </div>
        )}

        {snapshot.createdBy && (
          <div className="text-xs text-muted-foreground">
            Created by: {snapshot.createdBy.name}
          </div>
        )}
      </div>
    </div>
  );
}