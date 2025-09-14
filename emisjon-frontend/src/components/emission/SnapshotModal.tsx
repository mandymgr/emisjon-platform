import { useEffect, useState } from 'react';
import { FiUsers, FiCalendar } from 'react-icons/fi';
import Modal from '@/components/ui/Modal';
import { useNorwegianNumber } from '@/hooks/useNorwegianFormat';
import type { ShareholderSnapshot } from '@/types/emission';
import * as emissionsService from '@/features/dashboard/services/emissionsService';

interface SnapshotModalProps {
  isOpen: boolean;
  emissionId: string;
  emissionTitle: string;
  onClose: () => void;
}

export default function SnapshotModal({ 
  isOpen, 
  emissionId,
  emissionTitle,
  onClose
}: SnapshotModalProps) {
  const [snapshots, setSnapshots] = useState<ShareholderSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<ShareholderSnapshot | null>(null);
  const { formatNumber } = useNorwegianNumber();

  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await emissionsService.getEmissionSnapshots(emissionId);
        setSnapshots(data);
      } catch (err) {
        const error = err as Error & { response?: { data?: { error?: string } } };
        setError(error.response?.data?.error || 'Failed to fetch snapshots');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && emissionId) {
      fetchSnapshots();
    }
  }, [isOpen, emissionId]);



  const getSnapshotTypeBadge = (type: string) => {
    const styles = {
      BEFORE_APPROVAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      AFTER_FINALIZATION: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
    };
    const labels = {
      BEFORE_APPROVAL: 'Before First Approval',
      AFTER_FINALIZATION: 'After Finalization'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[type as keyof typeof styles]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Shareholder Snapshots"
      subtitle={emissionTitle}
      size="full"
    >

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading snapshots...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          ) : snapshots.length === 0 ? (
            <div className="text-center py-8">
              <FiUsers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No snapshots available yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Snapshots are created automatically when the first subscription is approved
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Snapshot List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    onClick={() => setSelectedSnapshot(snapshot)}
                    className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-colors cursor-pointer border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      {getSnapshotTypeBadge(snapshot.type)}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FiCalendar size={12} />
                        {new Date(snapshot.createdAt).toLocaleString('nb-NO')}
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-card-foreground">
                        Total Shares: {formatNumber(snapshot.totalShares)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {snapshot.snapshotData?.shareholders?.length || 0} shareholders
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Snapshot Details */}
              {selectedSnapshot && (
                <div className="mt-6 border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">
                    Snapshot Details - {getSnapshotTypeBadge(selectedSnapshot.type)}
                  </h3>
                  <div className="bg-card rounded-lg border border-border overflow-hidden">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Shareholder
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Shares
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Ownership %
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-border">
                        {selectedSnapshot.snapshotData?.shareholders?.map((shareholder) => (
                          <tr key={shareholder.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                              {shareholder.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {shareholder.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground text-right">
                              {formatNumber(shareholder.sharesOwned)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground text-right">
                              {((shareholder.sharesOwned / selectedSnapshot.totalShares) * 100).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

    </Modal>
  );
}