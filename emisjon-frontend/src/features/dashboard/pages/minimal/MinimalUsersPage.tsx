import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { getAllUsers } from '../services/usersService';
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
      <div className="max-w-7xl mx-auto">
        <div className="bg-card border border-border p-12 text-center rounded-lg">
          <UserX className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-light text-card-foreground mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">
            Admin Level 2+ access required to manage users
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto editorial-spacing">
      {/* Header - Professional Design */}
      <div className="mb-16">
        <h1 className="text-5xl font-normal text-foreground mb-3">Users</h1>
        <p className="text-lg font-light text-muted-foreground mb-8">
          Manage user accounts and permissions
        </p>
        <button className="btn-professional flex items-center space-x-3">
          <Plus className="h-5 w-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border p-8 mb-12 rounded-lg">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="h-5 w-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-professional w-full pl-12"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="input-professional min-w-[120px]"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as any)}
              className="input-professional min-w-[120px]"
            >
              <option value="ALL">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
            </select>

            <button className="px-4 py-3 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-lg">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border overflow-hidden rounded-lg">
        <div className="px-8 py-6 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                onChange={selectAllUsers}
                className="h-4 w-4 text-primary border-border rounded focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground font-light uppercase tracking-wider">
                {selectedUsers.size > 0 ? `${selectedUsers.size} selected` : `${filteredUsers.length} users`}
              </span>
            </div>

            {selectedUsers.size > 0 && (
              <div className="flex items-center space-x-2">
                <button className="text-sm text-red-600 hover:text-red-800 transition-colors">
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="w-8 px-6 py-3"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Role & Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="h-4 w-4 text-neutral-900 border-neutral-300 focus:ring-0"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-neutral-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-neutral-700">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
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
                      <span className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-800 rounded-full">
                        L{user.level}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${
                        user.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm text-neutral-600">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="text-neutral-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
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
            <UserX className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-sm text-neutral-500">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinimalUsersPage;