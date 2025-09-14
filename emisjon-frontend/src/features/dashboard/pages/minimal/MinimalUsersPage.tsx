import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { getAllUsers } from '../services/usersService';
import PageLayout from '@/components/layout/PageLayout';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit3,
  Trash2,
  UserX,
  Download,
  Loader2
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  level: number;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

const MinimalUsersPage = () => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [levelFilter, setLevelFilter] = useState<'ALL' | '1' | '2' | '3'>('ALL');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Check if user has access
  const hasAccess = currentUser?.role === 'ADMIN' && (currentUser?.level || 0) >= 2;

  useEffect(() => {
    if (!hasAccess) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await getAllUsers();
        // Transform service users to page users by adding missing fields
        const pageUsers = usersData.map(user => ({
          ...user,
          isActive: true, // Default to active
          lastLogin: new Date().toISOString() // Mock last login
        }));
        setUsers(pageUsers);
        setFilteredUsers(pageUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [hasAccess]);

  useEffect(() => {
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (levelFilter !== 'ALL') {
      filtered = filtered.filter(user => user.level === parseInt(levelFilter));
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, levelFilter]);

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  if (!hasAccess) {
    return (
      <PageLayout
        title="Brukere"
        subtitle="Tilgang nektet"
      >
        <div className="bg-white border border-gray-200 p-12 text-center rounded-2xl shadow-soft">
          <UserX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-serif text-teal-900 mb-2">Tilgang begrenset</h2>
          <p className="text-gray-600">
            Admin Nivå 2+ tilgang kreves for å administrere brukere
          </p>
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout
        title="Brukere"
        subtitle="Laster brukere..."
      >
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
        </div>
      </PageLayout>
    );
  }

  const actions = (
    <button className="bg-teal-700 hover:bg-teal-900 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors">
      <Plus className="h-4 w-4" />
      <span>Ny bruker</span>
    </button>
  );

  return (
    <PageLayout
      title="Brukere"
      subtitle={`Administrer brukerkontoer og tillatelser (${filteredUsers.length} brukere)`}
      actions={actions}
    >
      {/* Filtre */}
      <div className="bg-white border border-gray-200 p-6 mb-8 rounded-2xl shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Søk */}
          <div className="flex-1 relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Søk brukere..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
            />
          </div>

          {/* Filtre */}
          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'ADMIN' | 'USER')}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 min-w-[120px]"
            >
              <option value="ALL">Alle roller</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">Bruker</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as 'ALL' | '1' | '2' | '3')}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 min-w-[120px]"
            >
              <option value="ALL">Alle nivå</option>
              <option value="1">Nivå 1</option>
              <option value="2">Nivå 2</option>
              <option value="3">Nivå 3</option>
            </select>

            <button className="px-4 py-3 border border-gray-200 text-gray-600 hover:text-teal-700 hover:border-teal-200 transition-colors rounded-xl">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Brukertabell */}
      <div className="bg-white border border-gray-200 overflow-hidden rounded-2xl shadow-soft">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                onChange={selectAllUsers}
                className="h-4 w-4 text-teal-700 border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-600 font-light uppercase tracking-wider">
                {selectedUsers.size > 0 ? `${selectedUsers.size} valgt` : `${filteredUsers.length} brukere`}
              </span>
            </div>

            {selectedUsers.size > 0 && (
              <div className="flex items-center space-x-2">
                <button className="text-sm text-red-600 hover:text-red-800 transition-colors">
                  Slett valgte
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-8 px-6 py-3"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bruker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rolle & Nivå
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Siste innlogging
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="h-4 w-4 text-teal-700 border-gray-300 focus:ring-0"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-teal-700">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 rounded-full">
                        N{user.level}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${
                        user.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm text-gray-600">
                        {user.isActive ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString('nb-NO')
                      : 'Aldri'
                    }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-teal-600 transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserX className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">Ingen brukere funnet</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MinimalUsersPage;