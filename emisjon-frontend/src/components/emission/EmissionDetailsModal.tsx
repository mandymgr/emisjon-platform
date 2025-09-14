import { useState, Fragment } from 'react';
import { FiDatabase, FiActivity, FiDownload } from 'react-icons/fi';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { useNorwegianNumber } from '@/hooks/useNorwegianFormat';
import type { Emission } from '@/types/emission';
import { useAppSelector } from '@/store/hooks';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { sanitizeHtml } from '@/utils/sanitize';
import { downloadPdf } from '@/utils/download';
import SnapshotModal from './SnapshotModal';
import AuditLogModal from './AuditLogModal';

interface EmissionDetailsModalProps {
  isOpen: boolean;
  emission: Emission | null;
  onClose: () => void;
  onSubscribe?: () => void;
  onComplete?: () => void;
  onFinalize?: () => void;
  onActivate?: () => void;
}

export default function EmissionDetailsModal({ 
  isOpen, 
  emission, 
  onClose,
  onSubscribe,
  onComplete,
  onFinalize,
  onActivate
}: EmissionDetailsModalProps) {
  const { formatCurrency, formatNumber } = useNorwegianNumber();
  const { user } = useAppSelector(state => state.auth);
  const { error: alertError, showError, hideError } = useErrorAlert();
  const canSubscribe = user?.role === 'USER' && user?.level >= 3 && emission?.status === 'ACTIVE';
  const isAdmin = user?.role === 'ADMIN';
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [showAuditLogModal, setShowAuditLogModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!emission?.presentationFileUrl || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadPdf(
        emission.presentationFileUrl,
        `${emission.title.replace(/\s+/g, '_')}_presentation.pdf`
      );
    } catch (e) {
      showError('Failed to download the PDF. Please try again later.', 'Download Failed');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen || !emission) return null;

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      PREVIEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      ACTIVE: 'border border-gray-400 text-gray-700 bg-white dark:border-gray-500 dark:text-gray-300 dark:bg-gray-800',
      COMPLETED: 'border border-gray-400 text-gray-600 bg-gray-100 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300',
      FINALIZED: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status}
      </span>
    );
  };

  const totalValue = emission.newSharesOffered * emission.pricePerShare;
  const dilution = emission.sharesAfter ? ((emission.newSharesOffered / emission.sharesAfter) * 100).toFixed(2) : '0';

  return (
    <Fragment>
      <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={emission.title}
      size="lg"
      actions={
        <div className="flex items-center gap-3">
          {/* Admin Tools */}
          {isAdmin && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowSnapshotModal(true)}
                className="cursor-pointer flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <FiDatabase size={16} />
                <span>Snapshots</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAuditLogModal(true)}
                className="cursor-pointer flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <FiActivity size={16} />
                <span>Audit Log</span>
              </Button>
            </>
          )}

          {/* Action Buttons */}
          {isAdmin && emission.status === 'PREVIEW' && onActivate && (
            <Button
              onClick={onActivate}
              variant="default"
              className="cursor-pointer"
            >
              Activate
            </Button>
          )}
          {canSubscribe && onSubscribe && (
            <Button
              onClick={onSubscribe}
              className="cursor-pointer"
            >
              Subscribe
            </Button>
          )}
          {isAdmin && emission.status === 'ACTIVE' && onComplete && (
            <Button
              onClick={onComplete}
              variant="default"
              className="cursor-pointer bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 border-0 transition-colors"
            >
              Complete Emission
            </Button>
          )}
          {isAdmin && user?.level === 2 && emission.status === 'COMPLETED' && onFinalize && (
            <Button
              onClick={onFinalize}
              variant="default"
              className="cursor-pointer bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 border-0 transition-colors"
            >
              Finalize Emission
            </Button>
          )}
        </div>
      }
    >
      {/* Status and Created Date */}
      <div className="flex items-center gap-3 mb-6">
        {getStatusBadge(emission.status)}
        <span className="text-sm text-muted-foreground">
          Created {new Date(emission.createdAt || '').toLocaleDateString('nb-NO')}
        </span>
      </div>
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Description
            </h3>
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-card-foreground [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(emission.description) }}
            />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Share Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Shares Before:</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {formatNumber(emission.sharesBefore)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">New Shares Offered:</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {formatNumber(emission.newSharesOffered)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Shares After:</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {formatNumber(emission.sharesAfter)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Dilution:</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {dilution}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Financial Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price per Share:</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {formatCurrency(emission.pricePerShare)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Value:</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {formatCurrency(totalValue)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Start Date:</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {new Date(emission.startDate).toLocaleDateString('nb-NO')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">End Date:</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {new Date(emission.endDate).toLocaleDateString('nb-NO')}
                  </span>
                </div>
              </div>
            </div>
          </div>


          {/* PDF Document Link */}
          {emission.presentationFileUrl && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Documents
              </h3>
              {emission.isPreview && user?.role === 'USER' ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Documents are not available in preview mode.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className={`inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md transition-all ${
                    isDownloading 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-primary/90 cursor-pointer'
                  }`}
                >
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm font-medium">Downloading...</span>
                    </>
                  ) : (
                    <>
                      <FiDownload className="w-4 h-4" />
                      <span className="text-sm font-medium">Download file</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Status-specific information */}
          {emission.status === 'ACTIVE' && (
            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary dark:text-white mb-2">
                Emission is Active
              </h4>
              <p className="text-sm text-primary/80 dark:text-gray-300">
                This emission is currently accepting subscriptions. The subscription period ends on{' '}
                {new Date(emission.endDate).toLocaleDateString('nb-NO')}.
              </p>
            </div>
          )}

          {emission.status === 'COMPLETED' && (
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-300 mb-2">
                Emission Completed
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                This emission has been completed and is no longer accepting subscriptions.
              </p>
            </div>
          )}

          {emission.status === 'PREVIEW' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                Preview Status
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                {isAdmin 
                  ? 'This emission is in preview status and not yet visible to regular users. You can activate it to start accepting subscriptions.'
                  : 'This emission is in preview status. Full documentation will be available once the emission is active.'}
              </p>
            </div>
          )}

          {emission.status === 'FINALIZED' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
                Emission Finalized
              </h4>
              <p className="text-sm text-green-700 dark:text-green-400">
                This emission has been finalized. All approved subscriptions have been processed and shareholder records have been updated.
                {emission.finalizedAt && (
                  <span className="block mt-1">
                    Finalized on {new Date(emission.finalizedAt).toLocaleDateString('nb-NO')}
                    {emission.finalizedBy && ` by ${emission.finalizedBy.name}`}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Subscription Summary for Finalized Emissions */}
          {emission.status === 'FINALIZED' && emission.totalSharesSubscribed && (
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Final Results
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Shares Subscribed:</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {formatNumber(emission.totalSharesSubscribed)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subscription Rate:</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {((emission.totalSharesSubscribed / emission.newSharesOffered) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
    </Modal>

    {/* Modals */}
    {showSnapshotModal && emission && (
      <SnapshotModal
        isOpen={showSnapshotModal}
        emissionId={emission.id}
        emissionTitle={emission.title}
        onClose={() => setShowSnapshotModal(false)}
      />
    )}
    {showAuditLogModal && emission && (
      <AuditLogModal
        isOpen={showAuditLogModal}
        emissionId={emission.id}
        emissionTitle={emission.title}
        onClose={() => setShowAuditLogModal(false)}
      />
    )}

    {/* Error Alert Dialog */}
    <ErrorAlert
      open={alertError.open}
      onOpenChange={hideError}
      title={alertError.title}
      message={alertError.message}
    />
    </Fragment>
  );
}