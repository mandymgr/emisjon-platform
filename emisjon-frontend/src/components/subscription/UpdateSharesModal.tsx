import { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface UpdateSharesModalProps {
  isOpen: boolean;
  currentShares: number;
  onClose: () => void;
  onUpdate: (shares: number) => void;
}

export default function UpdateSharesModal({ 
  isOpen, 
  currentShares, 
  onClose, 
  onUpdate 
}: UpdateSharesModalProps) {
  const [shares, setShares] = useState(currentShares);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(shares);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
        >
          <FiX size={20} />
        </button>
        
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          Update Subscription
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter new number of shares:
            </label>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              min="1"
              required
              autoFocus
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 cursor-pointer"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}