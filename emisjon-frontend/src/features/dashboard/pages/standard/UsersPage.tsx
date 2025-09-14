import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AccessRestrictedCard } from '@/components/dashboard';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import PageLayout from '@/components/layout/PageLayout';
import UserSearchBar from '@/components/user/UserSearchBar';
import UserTableWithSort from '@/components/user/UserTableWithSort';
import AddUserModal from '@/components/user/AddUserModal';
import EditUserModal from '@/components/user/EditUserModal';
import DeleteUserModal from '@/components/user/DeleteUserModal';
import type { User, CreateUserDTO, UpdateUserDTO } from '@/components/user/types';
import * as usersService from '../services/usersService';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState<CreateUserDTO>({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'USER',
    level: 1
  });
  const { error: alertError, showError, hideError } = useErrorAlert();
  const [editUserData, setEditUserData] = useState<UpdateUserDTO>({});

  const currentUser = useAppSelector(state => state.auth.user);
  const isAdminLevel2 = currentUser?.role === 'ADMIN' && currentUser?.level === 2;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAllUsers();
      setUsers(data);
      setError('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to load users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserData({
      name: user.name,
      email: user.email,
      role: user.role,
      level: user.level
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (userId: string, data: UpdateUserDTO) => {
    try {
      const updatedUser = await usersService.updateUser(userId, data);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to update user';
      showError(errorMessage, 'Update Failed');
      throw err;
    }
  };

  const handleSaveEdit = async (data?: UpdateUserDTO) => {
    if (!editingUser) return;
    
    try {
      // Use the data passed from modal if available, otherwise use state
      const dataToUpdate = { ...(data || editUserData) };
      
      // Remove password if it's empty
      if (!dataToUpdate.password) {
        delete dataToUpdate.password;
      }
      
      await handleUpdateUser(editingUser.id, dataToUpdate);
      handleCloseEditModal();
    } catch {
      // Error is already handled in handleUpdateUser
    }
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;
    
    try {
      await usersService.deleteUser(deletingUser.id);
      setUsers(users.filter(u => u.id !== deletingUser.id));
      handleCloseDeleteModal();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to delete user';
      showError(errorMessage, 'Delete Failed');
    }
  };

  const handleAddUser = async (data?: CreateUserDTO) => {
    try {
      // Use the data passed from modal if available, otherwise use state
      const createData = data || newUserData;
      await usersService.createUser(createData);
      await loadUsers();
      handleCloseAddModal();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to create user';
      showError(errorMessage, 'Create Failed');
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewUserData({
      email: '',
      password: '',
      name: '',
      phone: '',
      role: 'USER',
      level: 1
    });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditUserData({});
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingUser(null);
  };

  // Access denied for non-admin level 2 users
  if (!isAdminLevel2) {
    return (
      <PageLayout
        title="Brukeradministrasjon"
        subtitle="Du trenger Admin Nivå 2 tilgang for å administrere brukere"
      >
        <AccessRestrictedCard
          message="Du trenger Admin Nivå 2 tilgang for å administrere brukere."
        />
      </PageLayout>
    );
  }

  // Loading state
  if (loading) {
    return (
      <PageLayout
        title="Brukeradministrasjon"
        subtitle="Laster brukere..."
      >
        {/* Search bar skeleton */}
        <div className="mb-6 flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-24" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-12 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
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

  // Error state
  if (error) {
    return (
      <PageLayout
        title="Brukeradministrasjon"
        subtitle="Det oppstod en feil ved lasting av brukere"
      >
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadUsers} className="mt-4">Prøv igjen</Button>
        </div>
      </PageLayout>
    );
  }

  const actions = (
    <Button
      onClick={() => setShowAddModal(true)}
      className="bg-teal-700 hover:bg-teal-900 text-white"
    >
      Ny bruker
    </Button>
  );

  return (
    <PageLayout
      title="Brukeradministrasjon"
      subtitle={`Administrer systembrukere (${users.length} brukere)`}
      actions={actions}
    >
      {/* Search bar */}
      <div className="mb-6">
        <UserSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddClick={() => setShowAddModal(true)}
        />
      </div>

      {/* Users table */}
      <UserTableWithSort
        users={filteredUsers}
        currentUserId={currentUser?.id}
        onUpdate={handleUpdateUser}
        onDelete={handleDeleteUser}
        onEdit={handleEditUser}
      />

      {/* Add user modal */}
      <AddUserModal
        isOpen={showAddModal}
        userData={newUserData}
        onUserDataChange={setNewUserData}
        onAdd={handleAddUser}
        onClose={handleCloseAddModal}
      />

      {/* Edit user modal */}
      <EditUserModal
        isOpen={showEditModal}
        user={editingUser}
        userData={editUserData}
        onUserDataChange={setEditUserData}
        onSave={handleSaveEdit}
        onClose={handleCloseEditModal}
      />

      {/* Delete user modal */}
      <DeleteUserModal
        isOpen={showDeleteModal}
        user={deletingUser}
        onDelete={confirmDeleteUser}
        onClose={handleCloseDeleteModal}
      />

      {/* Error Alert Dialog */}
      <ErrorAlert
        open={alertError.open}
        onOpenChange={hideError}
        title={alertError.title}
        message={alertError.message}
      />
    </PageLayout>
  );
}