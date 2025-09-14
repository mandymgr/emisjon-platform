import { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import * as emissionsService from '../services/emissionsService';
import type { Emission } from '@/components/emission/types';
import { useAppSelector } from '@/store/hooks';
import { useNorwegianNumber } from '@/hooks/useNorwegianFormat';
import { Skeleton } from '@/components/ui/skeleton';
import { AccessRestrictedCard } from '@/components/dashboard';
import AddEmissionModal from '../components/AddEmissionModal';
import EditEmissionModal from '../components/EditEmissionModal';
import DeleteEmissionModal from '../components/DeleteEmissionModal';
import SubscribeModal from '@/components/emission/SubscribeModal';
import EmissionDetailsModal from '@/components/emission/EmissionDetailsModal';
import SuccessDialog from '@/components/ui/SuccessDialog';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { getTextPreview } from '@/utils/htmlUtils';

export default function EmissionsPage() {
  const { user } = useAppSelector(state => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  const userLevel = user?.level || 1;
  const canViewEmissions = isAdmin || userLevel >= 3;
  
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmission, setSelectedEmission] = useState<Emission | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [emissionToFinalize, setEmissionToFinalize] = useState<Emission | null>(null);
  
  const { formatCurrency, formatNumber } = useNorwegianNumber();

  useEffect(() => {
    if (canViewEmissions) {
      fetchEmissions();
    }
  }, [canViewEmissions]);

  const fetchEmissions = async () => {
    try {
      setLoading(true);
      const data = await emissionsService.getAllEmissions();
      setEmissions(data);
      setError(null);
    } catch (err) {
      const error = err as Error & { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to fetch emissions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmission = () => {
    setShowAddModal(true);
  };

  const handleEditEmission = (emission: Emission) => {
    setSelectedEmission(emission);
    setShowEditModal(true);
  };

  const handleDeleteEmission = (emission: Emission) => {
    setSelectedEmission(emission);
    setShowDeleteModal(true);
  };

  const handleActivateEmission = async (emission: Emission) => {
    try {
      await emissionsService.activateEmission(emission.id);
      fetchEmissions();
    } catch (err) {
      const error = err as Error & { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to activate emission');
    }
  };

  const handleCompleteEmission = async (emission: Emission) => {
    try {
      await emissionsService.completeEmission(emission.id);
      fetchEmissions();
    } catch (err) {
      const error = err as Error & { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to complete emission');
    }
  };

  const handleFinalizeEmission = (emission: Emission) => {
    setEmissionToFinalize(emission);
    setShowFinalizeModal(true);
  };

  const confirmFinalizeEmission = async () => {
    if (!emissionToFinalize) return;
    
    try {
      await emissionsService.finalizeEmission(emissionToFinalize.id);
      fetchEmissions();
      setShowFinalizeModal(false);
      setEmissionToFinalize(null);
    } catch (err) {
      const error = err as Error & { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to finalize emission');
      setShowFinalizeModal(false);
      setEmissionToFinalize(null);
    }
  };

  const handleSubscribe = (emission: Emission) => {
    setSelectedEmission(emission);
    setShowSubscribeModal(true);
  };

  const handleViewDetails = (emission: Emission) => {
    setSelectedEmission(emission);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      PREVIEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      ACTIVE: 'border border-gray-400 text-gray-700 bg-white dark:border-gray-500 dark:text-gray-300 dark:bg-gray-800',
      COMPLETED: 'border border-gray-400 text-gray-600 bg-gray-100 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300',
      FINALIZED: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status}
      </span>
    );
  };

  if (!canViewEmissions) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">Emissions</h2>
        </div>
        <AccessRestrictedCard 
          requiredLevel={3}
          message="Emissions information requires Level 3+ access."
        />
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Emissions</h2>
        {isAdmin && (
          <button
            onClick={handleAddEmission}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors border border-primary cursor-pointer"
          >
            <FiPlus size={20} />
            <span>Add Emission</span>
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Emissions table */}
      <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(6)].map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <Skeleton className="h-8 w-16" />
                        {isAdmin && (
                          <>
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-16" />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : emissions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-muted-foreground">No emissions found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    New Shares
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price/Share
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {emissions.map((emission) => (
                  <tr key={emission.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => handleViewDetails(emission)}
                      >
                        <div className="text-sm font-medium text-card-foreground">
                          {emission.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getTextPreview(emission.description, 50)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-card-foreground">
                        {formatNumber(emission.newSharesOffered)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-card-foreground">
                        {formatCurrency(emission.pricePerShare)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-card-foreground">
                        {new Date(emission.startDate).toLocaleDateString('nb-NO')} -
                      </div>
                      <div className="text-sm text-card-foreground">
                        {new Date(emission.endDate).toLocaleDateString('nb-NO')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(emission.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* View button - always visible */}
                        <button
                          onClick={() => handleViewDetails(emission)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded cursor-pointer text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          View
                        </button>
                        
                        {/* Subscribe button for active emissions (all level 3 users) */}
                        {emission.status === 'ACTIVE' && !isAdmin && (
                          <button
                            onClick={() => handleSubscribe(emission)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
                          >
                            Subscribe
                          </button>
                        )}
                        
                        {/* Admin actions */}
                        {isAdmin && (
                          <>
                            {emission.status === 'PREVIEW' && (
                              <>
                                <button
                                  onClick={() => handleActivateEmission(emission)}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded cursor-pointer border border-gray-400 text-gray-700 hover:bg-gray-100 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                >
                                  Activate
                                </button>
                                <button
                                  onClick={() => handleEditEmission(emission)}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded cursor-pointer text-primary hover:text-primary/80 dark:text-white dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                  Edit
                                </button>
                                {user?.level === 2 && (
                                  <button
                                    onClick={() => handleDeleteEmission(emission)}
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded cursor-pointer text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    Delete
                                  </button>
                                )}
                              </>
                            )}
                            {emission.status === 'ACTIVE' && (
                              <>
                                <button
                                  onClick={() => handleCompleteEmission(emission)}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded cursor-pointer border border-gray-400 text-gray-700 hover:bg-gray-100 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => handleEditEmission(emission)}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded cursor-pointer text-primary hover:text-primary/80 dark:text-white dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                  Edit
                                </button>
                              </>
                            )}
                            {emission.status === 'COMPLETED' && user?.level === 2 && (
                              <button
                                onClick={() => handleFinalizeEmission(emission)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded cursor-pointer border border-green-400 text-green-700 hover:bg-green-100 dark:border-green-500 dark:text-green-300 dark:hover:bg-green-900/20 transition-colors"
                              >
                                Finalize
                              </button>
                            )}
                          </>
                        )}
                        
                        {/* Show dash for finalized emissions or when no actions available */}
                        {(emission.status === 'FINALIZED' || (emission.status === 'PREVIEW' && !isAdmin)) && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddEmissionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchEmissions();
          }}
        />
      )}
      {showEditModal && selectedEmission && (
        <EditEmissionModal
          emission={selectedEmission}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEmission(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedEmission(null);
            fetchEmissions();
          }}
        />
      )}
      {showDeleteModal && selectedEmission && (
        <DeleteEmissionModal
          emission={selectedEmission}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedEmission(null);
          }}
          onSuccess={() => {
            setShowDeleteModal(false);
            setSelectedEmission(null);
            fetchEmissions();
          }}
        />
      )}
      {showSubscribeModal && selectedEmission && (
        <SubscribeModal
          isOpen={showSubscribeModal}
          emission={{
            id: selectedEmission.id,
            title: selectedEmission.title,
            pricePerShare: selectedEmission.pricePerShare,
            newSharesOffered: selectedEmission.newSharesOffered
          }}
          onClose={() => {
            setShowSubscribeModal(false);
            setSelectedEmission(null);
          }}
          onSuccess={() => {
            setShowSubscribeModal(false);
            setSelectedEmission(null);
            setShowSuccessDialog(true);
          }}
        />
      )}
      {showDetailsModal && selectedEmission && (
        <EmissionDetailsModal
          isOpen={showDetailsModal}
          emission={selectedEmission}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEmission(null);
          }}
          onSubscribe={() => {
            setShowDetailsModal(false);
            handleSubscribe(selectedEmission);
          }}
          onComplete={() => {
            setShowDetailsModal(false);
            handleCompleteEmission(selectedEmission);
          }}
          onFinalize={() => {
            setShowDetailsModal(false);
            handleFinalizeEmission(selectedEmission);
          }}
          onActivate={() => {
            setShowDetailsModal(false);
            handleActivateEmission(selectedEmission);
          }}
        />
      )}
      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Success"
        message="Subscription request submitted successfully!"
      />
      {/* Finalize Confirmation Modal */}
      <ConfirmationModal
        isOpen={showFinalizeModal}
        onClose={() => {
          setShowFinalizeModal(false);
          setEmissionToFinalize(null);
        }}
        onConfirm={confirmFinalizeEmission}
        title="Finalize Emission"
        message="Are you sure you want to finalize this emission? This action cannot be undone."
        confirmText="Finalize"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
}