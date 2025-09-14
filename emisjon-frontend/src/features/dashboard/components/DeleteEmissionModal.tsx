import { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import * as emissionsService from '../services/emissionsService';
import type { Emission } from '@/components/emission/types';

interface DeleteEmissionModalProps {
  emission: Emission;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteEmissionModal({ emission, onClose, onSuccess }: DeleteEmissionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await emissionsService.deleteEmission(emission.id);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete emission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full">
            <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-center text-card-foreground">
              Delete Emission
            </h3>
            <p className="mt-2 text-sm text-center text-muted-foreground">
              Are you sure you want to delete the emission "{emission.title}"? This action cannot be undone.
            </p>
            {emission.status !== 'PREVIEW' && (
              <p className="mt-2 text-sm text-center text-red-600 dark:text-red-400">
                Note: Only PREVIEW emissions can be deleted.
              </p>
            )}
          </div>

          {error && (
            <div className="mt-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-muted"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              disabled={loading || emission.status !== 'PREVIEW'}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}