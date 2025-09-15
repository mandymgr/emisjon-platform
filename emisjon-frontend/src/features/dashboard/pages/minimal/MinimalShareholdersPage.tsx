import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import * as shareholdersService from '../../services/shareholdersService';
import type { Shareholder, CreateShareholderDTO, UpdateShareholderDTO } from '@/components/shareholder/types';
import PageLayout from '@/components/layout/PageLayout';
import AddShareholderModal from '@/components/shareholder/AddShareholderModal';
import EditShareholderModal from '@/components/shareholder/EditShareholderModal';
import DeleteShareholderModal from '@/components/shareholder/DeleteShareholderModal';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import {
  Search,
  Plus,
  Building2,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  UserX,
  Loader2,
  Phone,
  Mail,
  User
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
          <UserX className="h-16 w-16 text-gray-400 mx-auto mb-6" />
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
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
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
      className="bg-teal-700 hover:bg-teal-900 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors"
    >
      <Plus className="h-4 w-4" />
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
            <div className="bg-blue-100 p-3 rounded-xl">
              <Users className="h-5 w-5 text-blue-700" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Total Shareholders</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats.totalShareholders}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <TrendingUp className="h-5 w-5 text-green-700" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Total Shares</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats.totalShares.toLocaleString()}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Building2 className="h-5 w-5 text-purple-700" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Active Investors</p>
          <p className="text-3xl font-serif text-teal-900">
            {stats.activeInvestors}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-teal-100 p-3 rounded-xl">
              <Calendar className="h-5 w-5 text-teal-700" />
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search shareholders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Shareholders Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-serif text-teal-900">Shareholders</h2>
        </div>

        {error && (
          <div className="p-6 border-b border-gray-200">
            <div className="rounded-xl border border-red-300 bg-red-50 text-red-800 p-4">
              {error}
            </div>
          </div>
        )}

        {filteredShareholders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shareholder
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ownership %
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredShareholders.map((shareholder) => {
                  const ownershipPercentage = stats.totalShares > 0
                    ? ((shareholder.shares / stats.totalShares) * 100).toFixed(2)
                    : '0.00';

                  return (
                    <tr key={shareholder.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mr-4">
                            <User className="h-5 w-5 text-teal-700" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {shareholder.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {shareholder.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Mail className="h-3 w-3 text-gray-400 mr-2" />
                            {shareholder.email}
                          </div>
                          {shareholder.phone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 text-gray-400 mr-2" />
                              {shareholder.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {shareholder.shares.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {ownershipPercentage}%
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEditShareholder(shareholder)}
                                className="text-gray-600 hover:text-teal-700 transition-colors"
                                title="Edit shareholder"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteShareholder(shareholder)}
                                className="text-gray-600 hover:text-red-600 transition-colors"
                                title="Delete shareholder"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-serif text-teal-900 mb-3">No shareholders found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first shareholder to get started'}
            </p>
            {isAdmin && !searchTerm && (
              <Button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-teal-700 text-white text-sm hover:bg-teal-800 transition-colors rounded-xl"
              >
                Add Shareholder
              </Button>
            )}
          </div>
        )}
      </div>

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