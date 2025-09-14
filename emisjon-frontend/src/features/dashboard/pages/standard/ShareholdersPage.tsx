import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { AccessRestrictedCard } from '@/components/dashboard';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import ShareholderSearchBar from '@/components/shareholder/ShareholderSearchBar';
import ShareholderTableWithSort from '@/components/shareholder/ShareholderTableWithSort';
import AddShareholderModal from '@/components/shareholder/AddShareholderModal';
import EditShareholderModal from '@/components/shareholder/EditShareholderModal';
import DeleteShareholderModal from '@/components/shareholder/DeleteShareholderModal';
import type { Shareholder, CreateShareholderDTO, UpdateShareholderDTO } from '@/components/shareholder/types';
import * as shareholdersService from '../services/shareholdersService';

export default function ShareholdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingShareholder, setEditingShareholder] = useState<Shareholder | null>(null);
  const [deletingShareholder, setDeletingShareholder] = useState<Shareholder | null>(null);
  const [newShareholderData, setNewShareholderData] = useState<CreateShareholderDTO>({
    name: '',
    email: '',
    phone: '',
    shares: 0
  });
  const [editShareholderData, setEditShareholderData] = useState<UpdateShareholderDTO>({});
  const { error: alertError, showError, hideError } = useErrorAlert();

  const currentUser = useAppSelector(state => state.auth.user);
  const isAdmin = currentUser?.role === 'ADMIN';
  const canView = isAdmin || (currentUser?.role === 'USER' && currentUser?.level && currentUser.level >= 2);

  useEffect(() => {
    if (canView) {
      loadShareholders();
    }
  }, [canView]);

  const loadShareholders = async () => {
    try {
      setLoading(true);
      const data = await shareholdersService.getAllShareholders();
      // Sort shareholders by shares in descending order (highest shares first)
      const sortedData = data.sort((a, b) => {
        return b.shares - a.shares;
      });
      setShareholders(sortedData);
      setError('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to load shareholders';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredShareholders = shareholders.filter(shareholder =>
    shareholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shareholder.email.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleEditShareholder = (shareholder: Shareholder) => {
    setEditingShareholder(shareholder);
    setEditShareholderData({
      name: shareholder.name,
      email: shareholder.email,
      shares: shareholder.shares
    });
    setShowEditModal(true);
  };

  const handleUpdateShareholder = async (shareholderId: string, data: UpdateShareholderDTO) => {
    try {
      const updatedShareholder = await shareholdersService.updateShareholder(shareholderId, data);
      setShareholders(shareholders.map(sh => 
        sh.id === shareholderId ? updatedShareholder : sh
      ));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to update shareholder';
      showError(errorMessage, 'Update Failed');
      throw err;
    }
  };

  const handleSaveEdit = async (data?: UpdateShareholderDTO) => {
    if (!editingShareholder) return;
    
    try {
      // Use the data passed from modal if available, otherwise use state
      const updateData = data || editShareholderData;
      await handleUpdateShareholder(editingShareholder.id, updateData);
      handleCloseEditModal();
    } catch {
      // Error is already handled in handleUpdateShareholder
    }
  };

  const handleDeleteShareholder = (shareholder: Shareholder) => {
    setDeletingShareholder(shareholder);
    setShowDeleteModal(true);
  };

  const confirmDeleteShareholder = async () => {
    if (!deletingShareholder) return;
    
    try {
      await shareholdersService.deleteShareholder(deletingShareholder.id);
      setShareholders(shareholders.filter(sh => sh.id !== deletingShareholder.id));
      handleCloseDeleteModal();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to delete shareholder';
      showError(errorMessage, 'Delete Failed');
    }
  };

  const handleAddShareholder = async (data?: CreateShareholderDTO) => {
    try {
      // Use the data passed from modal if available, otherwise use state
      const createData = data || newShareholderData;
      await shareholdersService.createShareholder(createData);
      await loadShareholders(); // Reload to get updated percentages
      handleCloseAddModal();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to create shareholder';
      showError(errorMessage, 'Create Failed');
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewShareholderData({
      name: '',
      email: '',
      phone: '',
      shares: 0
    });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingShareholder(null);
    setEditShareholderData({});
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingShareholder(null);
  };

  // Access denied for non-authorized users
  if (!canView) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">Shareholders Management</h2>
        </div>
        <AccessRestrictedCard 
          requiredLevel={2}
          message="Shareholders information requires Level 2+ access."
        />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div>
        {/* Page header skeleton */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Search bar skeleton */}
        <div className="mb-6 flex gap-4">
          <Skeleton className="h-10 flex-1" />
          {isAdmin && <Skeleton className="h-10 w-40" />}
        </div>

        {/* Table skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-24" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-24" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3">
                      <Skeleton className="h-4 w-20" />
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(8)].map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-48" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={loadShareholders} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shareholders Management</h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Total Shareholders: {shareholders.length}
          </span>
        </div>
      </div>

      {/* Search bar */}
      <ShareholderSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => isAdmin && setShowAddModal(true)}
      />

      {/* Shareholders table */}
      <ShareholderTableWithSort
        shareholders={filteredShareholders}
        onDelete={isAdmin ? handleDeleteShareholder : () => {}}
        onEdit={isAdmin ? handleEditShareholder : () => {}}
      />

      {/* Add shareholder modal - Admin only */}
      {isAdmin && (
        <AddShareholderModal
          isOpen={showAddModal}
          shareholderData={newShareholderData}
          onShareholderDataChange={setNewShareholderData}
          onAdd={handleAddShareholder}
          onClose={handleCloseAddModal}
        />
      )}

      {/* Edit shareholder modal - Admin only */}
      {isAdmin && (
        <EditShareholderModal
          isOpen={showEditModal}
          shareholder={editingShareholder}
          shareholderData={editShareholderData}
          onShareholderDataChange={setEditShareholderData}
          onSave={handleSaveEdit}
          onClose={handleCloseEditModal}
        />
      )}

      {/* Delete shareholder modal - Admin only */}
      {isAdmin && (
        <DeleteShareholderModal
          isOpen={showDeleteModal}
          shareholder={deletingShareholder}
          onDelete={confirmDeleteShareholder}
          onClose={handleCloseDeleteModal}
        />
      )}

      {/* Error Alert Dialog */}
      <ErrorAlert
        open={alertError.open}
        onOpenChange={hideError}
        title={alertError.title}
        message={alertError.message}
      />
    </div>
  );
}