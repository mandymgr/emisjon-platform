import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { getAllShareholders, createShareholder, updateShareholder, deleteShareholder } from '../services/shareholdersService';
import PageLayout from '@/components/layout/PageLayout';
import {
  Search,
  Plus,
  Building2,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Download,
  Loader2,
  UserX,
  MoreHorizontal,
  Edit3,
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';

interface ShareholderWithExtras {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  shareCount: number;
  sharePercentage: number;
  createdAt: string;
  lastUpdated?: string;
  isActive: boolean;
}

const MinimalShareholdersPage = () => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [shareholders, setShareholders] = useState<ShareholderWithExtras[]>([]);
  const [filteredShareholders, setFilteredShareholders] = useState<ShareholderWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'shares' | 'percentage'>('shares');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShareholder, setSelectedShareholder] = useState<ShareholderWithExtras | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    shares: 0
  });

  // Check if user has access
  const hasAccess = currentUser && (currentUser?.level || 0) >= 2;

  useEffect(() => {
    if (!hasAccess) return;

    const fetchShareholders = async () => {
      try {
        setLoading(true);
        const shareholdersData = await getAllShareholders();

        // Add mock data for demo
        const enrichedData = shareholdersData.map((sh: any, index: number) => ({
          ...sh,
          shareCount: sh.shares || 0, // Map shares to shareCount
          sharePercentage: ((sh.shares || 0) / 1000000) * 100, // Mock calculation
          phone: index % 3 === 0 ? '+47 123 45 678' : undefined,
          address: index % 4 === 0 ? 'Oslo, Norway' : undefined,
          lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: Math.random() > 0.1, // 90% active
          createdAt: sh.joinedAt || sh.createdAt || new Date().toISOString()
        }));

        setShareholders(enrichedData);
        setFilteredShareholders(enrichedData);
      } catch (error) {
        console.error('Error fetching shareholders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShareholders();
  }, [hasAccess]);

  // Modal handlers
  const handleAddShareholder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      setActionLoading(true);
      const newShareholder = await createShareholder({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        shares: formData.shares
      });

      // Add to local state with enriched data
      const enrichedShareholder = {
        ...newShareholder,
        shareCount: newShareholder.shares || 0,
        sharePercentage: ((newShareholder.shares || 0) / 1000000) * 100,
        phone: formData.phone || undefined,
        address: undefined,
        lastUpdated: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      };

      setShareholders(prev => [...prev, enrichedShareholder]);
      setShowAddModal(false);
      setFormData({ name: '', email: '', phone: '', shares: 0 });
    } catch (error) {
      console.error('Error creating shareholder:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditShareholder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShareholder || !formData.name || !formData.email) return;

    try {
      setActionLoading(true);
      const updatedShareholder = await updateShareholder(selectedShareholder.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        shares: formData.shares
      });

      // Update local state
      setShareholders(prev => prev.map(sh =>
        sh.id === selectedShareholder.id
          ? { ...sh, ...updatedShareholder, shareCount: updatedShareholder.shares || 0 }
          : sh
      ));
      setShowEditModal(false);
      setSelectedShareholder(null);
      setFormData({ name: '', email: '', phone: '', shares: 0 });
    } catch (error) {
      console.error('Error updating shareholder:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteShareholder = async () => {
    if (!selectedShareholder) return;

    try {
      setActionLoading(true);
      await deleteShareholder(selectedShareholder.id);
      setShareholders(prev => prev.filter(sh => sh.id !== selectedShareholder.id));
      setShowDeleteModal(false);
      setSelectedShareholder(null);
    } catch (error) {
      console.error('Error deleting shareholder:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (shareholder: ShareholderWithExtras) => {
    setSelectedShareholder(shareholder);
    setFormData({
      name: shareholder.name,
      email: shareholder.email,
      phone: shareholder.phone || '',
      shares: shareholder.shareCount
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (shareholder: ShareholderWithExtras) => {
    setSelectedShareholder(shareholder);
    setShowDeleteModal(true);
  };

  const handleExportCSV = () => {
    const csvData = filteredShareholders.map(sh => ({
      Name: sh.name,
      Email: sh.email,
      Phone: sh.phone || 'N/A',
      Address: sh.address || 'N/A',
      Shares: sh.shareCount,
      'Ownership %': sh.sharePercentage.toFixed(2),
      Status: sh.isActive ? 'Active' : 'Inactive',
      'Created At': new Date(sh.createdAt).toLocaleDateString()
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val =>
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `shareholders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    let filtered = shareholders.filter(sh =>
      sh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sh.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'shares':
          aVal = a.shareCount;
          bVal = b.shareCount;
          break;
        case 'percentage':
          aVal = a.sharePercentage;
          bVal = b.sharePercentage;
          break;
        default:
          aVal = a.shareCount;
          bVal = b.shareCount;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      } else {
        return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      }
    });

    setFilteredShareholders(filtered);
  }, [shareholders, searchTerm, sortBy, sortOrder]);

  const totalShares = shareholders.reduce((sum, sh) => sum + sh.shareCount, 0);

  if (!hasAccess) {
    return (
      <PageLayout
        title="Aksjonærer"
        subtitle="Tilgang nektet"
      >
        <div className="bg-white border border-gray-200 p-12 text-center rounded-2xl shadow-soft">
          <UserX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-serif text-teal-900 mb-2">Tilgang begrenset</h2>
          <p className="text-gray-600">
            Nivå 2+ tilgang kreves for å se aksjonærer
          </p>
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout
        title="Aksjonærer"
        subtitle="Laster aksjonærer..."
      >
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
        </div>
      </PageLayout>
    );
  }

  const actions = (
    <button
      onClick={() => setShowAddModal(true)}
      className="bg-teal-700 hover:bg-teal-900 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
    >
      <Plus className="h-4 w-4" />
      <span>Ny aksjonær</span>
    </button>
  );

  return (
    <PageLayout
      title="Aksjonærer"
      subtitle={`Administrer selskapsaksjonærer og eierskapsstruktur (${filteredShareholders.length} aksjonærer)`}
      actions={actions}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-teal-100 p-3 rounded-xl">
              <Building2 className="h-5 w-5 text-teal-700" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Totale aksjonærer</p>
          <p className="text-3xl font-serif text-teal-900">{shareholders.length.toLocaleString('nb-NO')}</p>
        </div>
        
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <TrendingUp className="h-5 w-5 text-blue-700" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Totale aksjer</p>
          <p className="text-3xl font-serif text-teal-900">{totalShares.toLocaleString('nb-NO')}</p>
        </div>
        
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Calendar className="h-5 w-5 text-green-700" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Aktive aksjonærer</p>
          <p className="text-3xl font-serif text-teal-900">{shareholders.filter(sh => sh.isActive).length}</p>
        </div>
      </div>

        <div className="bg-white border border-neutral-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <Calendar className="h-6 w-6 text-neutral-600" />
          </div>
          <p className="text-xs font-light text-neutral-500 mb-3 uppercase tracking-wider">Active Shareholders</p>
          <p className="text-4xl font-extralight text-neutral-900">
            {shareholders.filter(sh => sh.isActive).length}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <Building2 className="h-6 w-6 text-neutral-600" />
          </div>
          <p className="text-xs font-light text-neutral-500 mb-3 uppercase tracking-wider">Avg. Ownership</p>
          <p className="text-4xl font-extralight text-neutral-900">
            {shareholders.length > 0 ? (100 / shareholders.length).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-neutral-200 p-8 mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="h-5 w-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search shareholders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'shares' | 'percentage')}
              className="px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
            >
              <option value="shares">Sort by Shares</option>
              <option value="name">Sort by Name</option>
              <option value="percentage">Sort by %</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-neutral-300 text-neutral-600 hover:text-neutral-900 transition-colors text-sm"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>

            <div className="flex border border-neutral-300">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 text-sm ${viewMode === 'cards' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:text-neutral-900'} transition-colors`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm border-l border-neutral-300 ${viewMode === 'list' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:text-neutral-900'} transition-colors`}
              >
                List
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 border border-neutral-300 text-neutral-600 hover:text-neutral-900 transition-colors"
              title="Export to CSV"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Shareholders Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShareholders.map((shareholder) => (
            <div key={shareholder.id} className="bg-white border border-neutral-200 p-6 hover:border-neutral-400 transition-colors flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 bg-neutral-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-neutral-700">
                    {shareholder.name?.charAt(0) || '?'}{shareholder.name?.split(' ')[1]?.charAt(0) || ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${shareholder.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4 flex-1">
                <h3 className="text-xl font-light text-neutral-900 mb-2">
                  {shareholder.name}
                </h3>
                <div className="flex items-center space-x-1 text-sm text-neutral-500 mb-2">
                  <Mail className="h-3 w-3" />
                  <span>{shareholder.email}</span>
                </div>
                <div className="min-h-[1.25rem] mb-2">
                  {shareholder.phone && (
                    <div className="flex items-center space-x-1 text-sm text-neutral-500">
                      <Phone className="h-3 w-3" />
                      <span>{shareholder.phone}</span>
                    </div>
                  )}
                </div>
                <div className="min-h-[1.25rem]">
                  {shareholder.address && (
                    <div className="flex items-center space-x-1 text-sm text-neutral-500">
                      <MapPin className="h-3 w-3" />
                      <span>{shareholder.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto">
                <div className="border-t border-neutral-200 pt-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-neutral-600">Shares</span>
                    <span className="text-sm font-medium text-neutral-900">
                      {shareholder.shareCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Ownership</span>
                    <span className="text-sm font-medium text-neutral-900">
                      {shareholder.sharePercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(shareholder)}
                    className="flex-1 py-2 border border-neutral-300 text-sm text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 transition-colors"
                  >
                    <Edit3 className="h-4 w-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(shareholder)}
                    className="flex-1 py-2 border border-red-300 text-sm text-red-600 hover:text-red-800 hover:border-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-neutral-200">
          {/* Minimal List Header */}
          <div className="p-8 border-b border-neutral-200">
            <div className="grid grid-cols-12 gap-4 text-xs font-light text-neutral-500 uppercase tracking-wider">
              <div className="col-span-4">Shareholder</div>
              <div className="col-span-2">Shares</div>
              <div className="col-span-2">Ownership</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Actions</div>
            </div>
          </div>

          {/* Minimal List Items */}
          <div className="divide-y divide-neutral-100">
            {filteredShareholders.map((shareholder) => (
              <div key={shareholder.id} className="p-8 hover:bg-neutral-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Shareholder Info */}
                  <div className="col-span-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-neutral-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-neutral-700">
                          {shareholder.name?.charAt(0) || '?'}{shareholder.name?.split(' ')[1]?.charAt(0) || ''}
                        </span>
                      </div>
                      <div>
                        <p className="text-lg font-light text-neutral-900 mb-1">
                          {shareholder.name}
                        </p>
                        <p className="text-sm text-neutral-500">{shareholder.email}</p>
                        {(shareholder.phone || shareholder.address) && (
                          <div className="flex items-center space-x-4 text-xs text-neutral-400 mt-1">
                            {shareholder.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{shareholder.phone}</span>
                              </div>
                            )}
                            {shareholder.address && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{shareholder.address}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shares */}
                  <div className="col-span-2">
                    <p className="text-lg font-light text-neutral-900">
                      {shareholder.shareCount.toLocaleString()}
                    </p>
                  </div>

                  {/* Ownership */}
                  <div className="col-span-2">
                    <p className="text-lg font-light text-neutral-900">
                      {shareholder.sharePercentage.toFixed(2)}%
                    </p>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${shareholder.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-light text-neutral-600">
                        {shareholder.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => openEditModal(shareholder)}
                        className="p-2 border border-neutral-300 text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(shareholder)}
                        className="p-2 border border-red-300 text-red-600 hover:text-red-800 hover:border-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredShareholders.length === 0 && (
        <div className="text-center py-12 bg-white border border-neutral-200">
          <Building2 className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-sm text-neutral-500">No shareholders found</p>
        </div>
      )}

      {/* Add Shareholder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-light text-neutral-900">Add Shareholder</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleAddShareholder} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                    placeholder="+47 123 45 678"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-700 mb-2">Shares</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.shares}
                    onChange={(e) => setFormData(prev => ({ ...prev, shares: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                    placeholder="1000"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border border-neutral-300 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Shareholder</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Shareholder Modal */}
      {showEditModal && selectedShareholder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-light text-neutral-900">Edit Shareholder</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleEditShareholder} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-700 mb-2">Shares</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.shares}
                    onChange={(e) => setFormData(prev => ({ ...prev, shares: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 border border-neutral-300 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedShareholder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-light text-neutral-900">Delete Shareholder</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-neutral-900 font-medium">Are you sure?</p>
                  <p className="text-sm text-neutral-600">
                    Delete shareholder "{selectedShareholder.name}" permanently? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2 border border-neutral-300 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteShareholder}
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default MinimalShareholdersPage;