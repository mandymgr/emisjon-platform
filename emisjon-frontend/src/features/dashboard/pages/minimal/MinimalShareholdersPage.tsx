import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import * as shareholdersService from '../../services/shareholdersService';
import type { Shareholder, CreateShareholderDTO, UpdateShareholderDTO } from '@/components/shareholder/types';
import PageLayout from '@/components/layout/PageLayout';
import AddShareholderModal from '@/components/shareholder/AddShareholderModal';
import EditShareholderModal from '@/components/shareholder/EditShareholderModal';
import DeleteShareholderModal from '@/components/shareholder/DeleteShareholderModal';
import ShareholderSearchBar from '@/components/shareholder/ShareholderSearchBar';
import ShareholderTableWithSort from '@/components/shareholder/ShareholderTableWithSort';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import {
  Plus,
  Building2,
  TrendingUp,
  Calendar,
  UserX,
  Loader2,
  Users
} from 'lucide-react';

const MinimalShareholdersPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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

  // Check access permission
  const isAdmin = user?.role === 'ADMIN';
  const canView = isAdmin || (user?.role === 'USER' && user?.level && user.level >= 2);

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
      const updateData = data || editShareholderData;
      await handleUpdateShareholder(editingShareholder.id, updateData);
      setShowEditModal(false);
      setEditingShareholder(null);
      setEditShareholderData({});
    } catch (err) {
      // Error already handled in handleUpdateShareholder
    }
  };

  const handleDeleteShareholder = (shareholder: Shareholder) => {
    setDeletingShareholder(shareholder);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingShareholder) return;

    try {
      await shareholdersService.deleteShareholder(deletingShareholder.id);
      setShareholders(shareholders.filter(sh => sh.id !== deletingShareholder.id));
      setShowDeleteModal(false);
      setDeletingShareholder(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to delete shareholder';
      showError(errorMessage, 'Delete Failed');
    }
  };

  const handleAddShareholder = async (data: CreateShareholderDTO) => {
    try {
      const newShareholder = await shareholdersService.createShareholder(data);
      setShareholders([...shareholders, newShareholder]);
      setShowAddModal(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to create shareholder';
      showError(errorMessage, 'Create Failed');
      throw err;
    }
  };

  if (!canView) {
    return (
      <PageLayout
        title="Shareholders"
        subtitle="Access denied"
      >
        <div className="bg-white border border-gray-200 p-12 text-center rounded-2xl shadow-soft">
          <UserX className="h-16 w-16 text-sidebar-foreground/30 mx-auto mb-6" />
          <h2 className="text-2xl font-serif text-teal-900 mb-3">Level 2+ Access Required</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Shareholder management requires Level 2+ access or admin privileges.
          </p>
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout
        title="Shareholders"
        subtitle="Loading shareholders..."
      >
        {/* Stats Overview Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gray-100 p-3 rounded-xl">
                  <Skeleton className="h-5 w-5" />
                </div>
              </div>
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Search bar skeleton */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <Skeleton className="h-10 flex-1 max-w-md" />
              {isAdmin && <Skeleton className="h-10 w-40" />}
            </div>
          </div>
        </div>

        {/* Table skeleton */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[...Array(5)].map((_, i) => (
                    <th key={i} className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...Array(8)].map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full mr-4" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <Skeleton className="h-4 w-40 mb-1" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-4" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageLayout>
    );
  }

  const stats = {
    totalShareholders: shareholders.length,
    totalShares: shareholders.reduce((sum, sh) => sum + sh.shares, 0),
    activeInvestors: shareholders.filter(sh => sh.shares > 0).length,
    avgShares: shareholders.length > 0 ? Math.round(shareholders.reduce((sum, sh) => sum + sh.shares, 0) / shareholders.length) : 0
  };

  const actions = isAdmin ? (
    <Button
      onClick={() => setShowAddModal(true)}
      className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors"
    >
      <Plus className="h-4 w-4 text-gray-600" />
      <span>Add Shareholder</span>
    </Button>
  ) : null;

  return (
    <PageLayout
      title="Shareholders"
      subtitle={`Manage company shareholders and ownership (${shareholders.length} shareholders)`}
      actions={actions}
    >
      {/* Error Alert */}
      {alertError && (
        <div className="mb-6">
          <ErrorAlert error={alertError} onDismiss={hideError} />
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 relative">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Total Shareholders</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats.totalShareholders}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 relative">
              <TrendingUp className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Total Shares</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats.totalShares.toLocaleString()}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 relative">
              <Building2 className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Active Investors</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats.activeInvestors}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 relative">
              <Calendar className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Avg. Shares</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats.avgShares.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <ShareholderSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddClick={() => setShowAddModal(true)}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <div className="rounded-xl border border-gray-300 bg-gray-50 text-gray-600 p-4">
            {error}
          </div>
        </div>
      )}

      {/* Shareholders Table */}
      <ShareholderTableWithSort
        shareholders={filteredShareholders}
        onDelete={handleDeleteShareholder}
        onEdit={handleEditShareholder}
      />

      {/* Modals */}
      {showAddModal && (
        <AddShareholderModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={(data) => handleAddShareholder(data)}
        />
      )}

      {showEditModal && editingShareholder && (
        <EditShareholderModal
          isOpen={showEditModal}
          shareholder={editingShareholder}
          onClose={() => {
            setShowEditModal(false);
            setEditingShareholder(null);
            setEditShareholderData({});
          }}
          onSuccess={(data) => handleSaveEdit(data)}
        />
      )}

      {showDeleteModal && deletingShareholder && (
        <DeleteShareholderModal
          isOpen={showDeleteModal}
          shareholder={deletingShareholder}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingShareholder(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </PageLayout>
  );
};

export default MinimalShareholdersPage;