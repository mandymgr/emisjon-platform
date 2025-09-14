import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useNorwegianNumber } from '@/hooks/useNorwegianFormat';
import type { Subscription } from '@/types/subscription';

interface EditSubscriptionModalProps {
  isOpen: boolean;
  subscription: Subscription | null;
  onSave: (sharesRequested: number) => void;
  onClose: () => void;
}

export default function EditSubscriptionModal({ 
  isOpen, 
  subscription,
  onSave, 
  onClose 
}: EditSubscriptionModalProps) {
  const [sharesRequested, setSharesRequested] = useState<string>('');
  const { formatCurrency, formatNumber } = useNorwegianNumber();

  if (!isOpen || !subscription) return null;

  // Initialize shares value when modal opens
  if (sharesRequested === '' && subscription) {
    setSharesRequested(subscription.sharesRequested.toString());
  }

  const handleSave = () => {
    const shares = parseInt(sharesRequested);
    if (!isNaN(shares) && shares > 0) {
      onSave(shares);
      setSharesRequested('');
      onClose();
    }
  };

  const handleClose = () => {
    setSharesRequested('');
    onClose();
  };

  const totalAmount = subscription.emission?.pricePerShare 
    ? parseInt(sharesRequested || '0') * subscription.emission.pricePerShare
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <FiX size={20} />
        </button>
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Edit Subscription</h3>
        
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {subscription.emission?.title}
            </p>
            {subscription.emission?.pricePerShare && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Price per share: {formatCurrency(subscription.emission.pricePerShare)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Number of shares
            </label>
            <input
              type="number"
              value={sharesRequested}
              onChange={(e) => setSharesRequested(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
              placeholder="Enter number of shares"
              min="1"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Current: {formatNumber(subscription.sharesRequested)} shares
            </p>
          </div>

          {subscription.emission?.pricePerShare && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Total Amount
              </p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!sharesRequested || parseInt(sharesRequested) <= 0}
            className="border-2 border-white/20 hover:border-white/40"
          >
            Update Subscription
          </Button>
        </div>
      </div>
    </div>
  );
}