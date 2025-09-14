import { Button } from '@/components/ui/button';
import type { Shareholder } from './types';
import { useNorwegianNumber } from '@/hooks';

interface DeleteShareholderModalProps {
  isOpen: boolean;
  shareholder: Shareholder | null;
  onDelete: () => void;
  onClose: () => void;
}

export default function DeleteShareholderModal({ 
  isOpen, 
  shareholder, 
  onDelete, 
  onClose 
}: DeleteShareholderModalProps) {
  const { formatNumber } = useNorwegianNumber();
  
  if (!isOpen || !shareholder) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Delete Shareholder
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete the shareholder <strong>{shareholder.name}</strong> 
          ({shareholder.email}) with <strong>{formatNumber(shareholder.shares)}</strong> shares? 
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
            Delete Shareholder
          </Button>
        </div>
      </div>
    </div>
  );
}