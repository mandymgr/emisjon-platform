import { Button } from '@/components/ui/button';
import type { User } from './types';

interface DeleteUserModalProps {
  isOpen: boolean;
  user: User | null;
  onDelete: () => void;
  onClose: () => void;
}

export default function DeleteUserModal({ 
  isOpen, 
  user, 
  onDelete, 
  onClose 
}: DeleteUserModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Delete User
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete the user <strong>{user.name}</strong> ({user.email})? 
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700 text-white border-2 border-red-700/20 hover:border-red-700/40"
          >
            Delete User
          </Button>
        </div>
      </div>
    </div>
  );
}