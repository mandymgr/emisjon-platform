import { useEffect, useState } from 'react';
import { FiActivity, FiUser, FiCalendar } from 'react-icons/fi';
import Modal from '@/components/ui/Modal';
import type { EmissionAuditLog } from '@/types/emission';
import * as emissionsService from '@/features/dashboard/services/emissionsService';

interface AuditLogModalProps {
  isOpen: boolean;
  emissionId: string;
  emissionTitle: string;
  onClose: () => void;
}

export default function AuditLogModal({ 
  isOpen, 
  emissionId,
  emissionTitle,
  onClose
}: AuditLogModalProps) {
  const [auditLogs, setAuditLogs] = useState<EmissionAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await emissionsService.getEmissionAuditLogs(emissionId);
        setAuditLogs(data);
      } catch (err) {
        const error = err as Error & { response?: { data?: { error?: string } } };
        setError(error.response?.data?.error || 'Failed to fetch audit logs');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && emissionId) {
      fetchAuditLogs();
    }
  }, [isOpen, emissionId]);



  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
      PUBLISH: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
      FINALIZE: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      APPROVE_SUBSCRIPTION: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      REJECT_SUBSCRIPTION: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[action] || 'bg-gray-100 text-gray-700'}`}>
        {action.replace(/_/g, ' ')}
      </span>
    );
  };

  const getActionDescription = (log: EmissionAuditLog) => {
    switch (log.action) {
      case 'CREATE':
        return 'Created emission';
      case 'UPDATE':
        if (log.changes) {
          const fields = Object.keys(log.changes).join(', ');
          return `Updated: ${fields}`;
        }
        return 'Updated emission';
      case 'DELETE':
        return 'Deleted emission';
      case 'PUBLISH':
        return 'Published emission';
      case 'FINALIZE':
        return 'Finalized emission and updated shareholder records';
      case 'APPROVE_SUBSCRIPTION':
        return `Approved subscription${log.metadata?.userName ? ` for ${log.metadata.userName}` : ''}`;
      case 'REJECT_SUBSCRIPTION':
        return `Rejected subscription${log.metadata?.userName ? ` for ${log.metadata.userName}` : ''}`;
      default:
        return (log.action as string).replace(/_/g, ' ').toLowerCase();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Log"
      subtitle={emissionTitle}
      size="xl"
    >
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8">
              <FiActivity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No audit logs available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-muted/30 rounded-lg p-4 border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getActionBadge(log.action)}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <FiUser size={14} />
                        <span>{log.user?.name || 'Unknown User'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FiCalendar size={12} />
                      <span>{new Date(log.createdAt).toLocaleString('nb-NO')}</span>
                    </div>
                  </div>
                  <p className="text-sm text-card-foreground mt-2">
                    {getActionDescription(log)}
                  </p>
                  {log.changes && Object.keys(log.changes).length > 0 && (
                    <div className="mt-3 p-3 bg-background rounded border border-border">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Changes:</p>
                      <div className="space-y-1">
                        {Object.entries(log.changes).map(([key, value]) => (
                          <div key={key} className="flex items-start gap-2 text-xs">
                            <span className="text-muted-foreground font-medium">{key}:</span>
                            <span className="text-card-foreground">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
    </Modal>
  );
}