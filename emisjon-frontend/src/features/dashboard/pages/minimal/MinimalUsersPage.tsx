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
  Loader2,
  Users,
  Shield,
  TrendingUp
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
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
        title="Users"
        subtitle="Access Denied"
      >
        <div className="bg-white border border-gray-200 p-12 text-center rounded-2xl shadow-soft">
          <UserX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-serif text-teal-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">
            Admin Level 2+ access required to manage users
          </p>
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout
        title="Users"
        subtitle="Loading users..."
      >
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      </PageLayout>
    );
  }

  const actions = (
    <button className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors">
      <Plus className="h-4 w-4" />
      <span>New User</span>
    </button>
  );

  return (
    <PageLayout
      title="Users"
      subtitle={`Manage user accounts and permissions (${filteredUsers.length} users)`}
      actions={actions}
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Total Users</p>
          <p className="text-3xl font-serif text-teal-900">
            {users.length}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3">
              <UserX className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Active Users</p>
          <p className="text-3xl font-serif text-teal-900">
            {users.filter(u => u.isActive).length}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3">
              <Shield className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Admin Users</p>
          <p className="text-3xl font-serif text-teal-900">
            {users.filter(u => u.role === 'ADMIN').length}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3">
              <TrendingUp className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">Level 3 Users</p>
          <p className="text-3xl font-serif text-teal-900">
            {users.filter(u => u.level >= 3).length}
          </p>
        </div>
      </div>

      {/* Filtre */}
      <div className="bg-white border border-gray-200 p-6 mb-8 rounded-2xl shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Søk */}
          <div className="flex-1 relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-teal-900"
            />
          </div>

          {/* Filtre */}
          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'ADMIN' | 'USER')}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-teal-900 min-w-[120px]"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as 'ALL' | '1' | '2' | '3')}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-teal-900 min-w-[120px]"
            >
              <option value="ALL">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
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
                className="h-4 w-4 text-gray-400 border-gray-300 rounded focus:ring-2 focus:ring-gray-200"
              />
              <span className="text-sm text-gray-600 font-light uppercase tracking-wider">
                {selectedUsers.size > 0 ? `${selectedUsers.size} selected` : `${filteredUsers.length} users`}
              </span>
            </div>

            {selectedUsers.size > 0 && (
              <div className="flex items-center space-x-2">
                <button className="text-sm text-black hover:text-gray-800 transition-colors">
                  Delete Selected
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
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                      className="h-4 w-4 text-gray-400 border-gray-300 rounded focus:ring-2 focus:ring-gray-200"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-teal-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-gray-50 text-gray-600'
                      }`}>
                        {user.role}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        N{user.level}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${
                        user.isActive ? 'bg-gray-500' : 'bg-black'
                      }`} />
                      <span className="text-sm text-gray-600">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString('nb-NO')
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-black transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-black transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-black transition-colors">
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
            <p className="text-sm text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MinimalUsersPage;