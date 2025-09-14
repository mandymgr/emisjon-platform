import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { getAllShareholders, createShareholder, updateShareholder, deleteShareholder, type Shareholder } from '../services/shareholdersService';
import PageLayout from '@/components/layout/PageLayout';
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
  MapPin,
  User,
  X
} from 'lucide-react';

const MinimalShareholdersPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [filteredShareholders, setFilteredShareholders] = useState<Shareholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShareholder, setSelectedShareholder] = useState<Shareholder | null>(null);
  const [newShareholder, setNewShareholder] = useState<Partial<Shareholder>>({
    name: '',
    email: '',
    shareCount: 0,
    ownershipPercentage: 0,
    shareClass: 'A',
    contactPhone: '',
    address: '',
    isActive: true
  });

  // Check access permission
  const hasAccess = user && user.level >= 2;

  useEffect(() => {
    if (hasAccess) {
      fetchShareholders();
    }
  }, [hasAccess]);

  const fetchShareholders = async () => {
    try {
      setLoading(true);
      const data = await getAllShareholders();
      setShareholders(data);
      setFilteredShareholders(data);
    } catch (error) {
      console.error('Error fetching shareholders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort shareholders
  useEffect(() => {
    let filtered = shareholders.filter(shareholder =>
      shareholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shareholder.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shareholder.shareClass.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Shareholder];
      const bValue = b[sortBy as keyof Shareholder];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    setFilteredShareholders(filtered);
  }, [shareholders, searchTerm, sortBy, sortOrder]);

  const handleCreateShareholder = async () => {
    try {
      const shareholderData: Omit<Shareholder, 'id'> = {
        ...newShareholder as Omit<Shareholder, 'id'>,
        registrationDate: new Date().toISOString()
      };
      
      await createShareholder(shareholderData);
      await fetchShareholders();
      setShowCreateModal(false);
      setNewShareholder({
        name: '',
        email: '',
        shareCount: 0,
        ownershipPercentage: 0,
        shareClass: 'A',
        contactPhone: '',
        address: '',
        isActive: true
      });
    } catch (error) {
      console.error('Error creating shareholder:', error);
    }
  };

  const handleUpdateShareholder = async () => {
    if (!selectedShareholder) return;
    
    try {
      await updateShareholder(selectedShareholder.id, selectedShareholder);
      await fetchShareholders();
      setShowEditModal(false);
      setSelectedShareholder(null);
    } catch (error) {
      console.error('Error updating shareholder:', error);
    }
  };

  const handleDeleteShareholder = async () => {
    if (!selectedShareholder) return;
    
    try {
      await deleteShareholder(selectedShareholder.id);
      await fetchShareholders();
      setShowDeleteModal(false);
      setSelectedShareholder(null);
    } catch (error) {
      console.error('Error deleting shareholder:', error);
    }
  };

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
      onClick={() => setShowCreateModal(true)}
      className="flex items-center space-x-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-xl transition-colors font-light"
    >
      <Plus className="h-4 w-4" />
      <span>Ny aksjonær</span>
    </button>
  );

  const totalShares = shareholders.reduce((sum, sh) => sum + sh.shareCount, 0);
  const activeShareholderCount = shareholders.filter(sh => sh.isActive).length;
  const averageOwnership = shareholders.length > 0 ? (100 / shareholders.length).toFixed(1) : '0';

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
            <div className="bg-teal-100 p-3 rounded-xl">
              <TrendingUp className="h-5 w-5 text-teal-700" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Aktive aksjonærer</p>
          <p className="text-3xl font-serif text-teal-900">{activeShareholderCount.toLocaleString('nb-NO')}</p>
        </div>
        
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-teal-100 p-3 rounded-xl">
              <Calendar className="h-5 w-5 text-teal-700" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Snitt eierskap</p>
          <p className="text-3xl font-serif text-teal-900">{averageOwnership}%</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 p-8 mb-8 rounded-2xl shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Søk etter navn, e-post eller aksjeklasse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="name">Navn</option>
              <option value="shareCount">Antall aksjer</option>
              <option value="ownershipPercentage">Eierskap %</option>
              <option value="registrationDate">Registreringsdato</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Shareholders Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksjonær</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontakt</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksjer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eierskap</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handlinger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredShareholders.map((shareholder) => (
                <tr key={shareholder.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-teal-700" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{shareholder.name}</div>
                        <div className="text-sm text-gray-500">Klasse {shareholder.shareClass}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-center mb-1">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      {shareholder.email}
                    </div>
                    {shareholder.contactPhone && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        {shareholder.contactPhone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {shareholder.shareCount.toLocaleString('nb-NO')}
                    </div>
                    <div className="text-sm text-gray-500">av {totalShares.toLocaleString('nb-NO')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {shareholder.ownershipPercentage.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      shareholder.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {shareholder.isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedShareholder(shareholder);
                          setShowEditModal(true);
                        }}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedShareholder(shareholder);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif text-gray-900">Ny aksjonær</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Navn</label>
                <input
                  type="text"
                  value={newShareholder.name || ''}
                  onChange={(e) => setNewShareholder({ ...newShareholder, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
                <input
                  type="email"
                  value={newShareholder.email || ''}
                  onChange={(e) => setNewShareholder({ ...newShareholder, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Antall aksjer</label>
                  <input
                    type="number"
                    value={newShareholder.shareCount || 0}
                    onChange={(e) => setNewShareholder({ ...newShareholder, shareCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eierskap %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newShareholder.ownershipPercentage || 0}
                    onChange={(e) => setNewShareholder({ ...newShareholder, ownershipPercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={handleCreateShareholder}
                className="flex-1 px-4 py-2 bg-teal-700 text-white rounded-xl hover:bg-teal-800 transition-colors"
              >
                Opprett
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedShareholder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif text-gray-900">Rediger aksjonær</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Navn</label>
                <input
                  type="text"
                  value={selectedShareholder.name}
                  onChange={(e) => setSelectedShareholder({ ...selectedShareholder, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
                <input
                  type="email"
                  value={selectedShareholder.email}
                  onChange={(e) => setSelectedShareholder({ ...selectedShareholder, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Antall aksjer</label>
                  <input
                    type="number"
                    value={selectedShareholder.shareCount}
                    onChange={(e) => setSelectedShareholder({ ...selectedShareholder, shareCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eierskap %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedShareholder.ownershipPercentage}
                    onChange={(e) => setSelectedShareholder({ ...selectedShareholder, ownershipPercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={handleUpdateShareholder}
                className="flex-1 px-4 py-2 bg-teal-700 text-white rounded-xl hover:bg-teal-800 transition-colors"
              >
                Oppdater
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedShareholder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif text-gray-900">Slett aksjonær</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Er du sikker på at du vil slette aksjonær "{selectedShareholder.name}"? Denne handlingen kan ikke angres.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={handleDeleteShareholder}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Slett
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default MinimalShareholdersPage;