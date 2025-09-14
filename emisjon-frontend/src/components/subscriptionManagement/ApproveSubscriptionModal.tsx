import { useState } from 'react';
import { FiCheckCircle, FiX, FiHash } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

interface ApproveSubscriptionModalProps {
  isOpen: boolean;
  subscription: {
    sharesRequested: number;
    userName?: string;
    emissionTitle?: string;
  } | null;
  onClose: () => void;
  onApprove: (sharesAllocated: number) => void;
}

export default function ApproveSubscriptionModal({
  isOpen,
  subscription,
  onClose,
  onApprove
}: ApproveSubscriptionModalProps) {
  const [sharesAllocated, setSharesAllocated] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !subscription) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const shares = parseInt(sharesAllocated);
    if (isNaN(shares) || shares <= 0) {
      setError('Please enter a valid number of shares');
      return;
    }

    if (shares > subscription.sharesRequested) {
      setError(`Cannot allocate more than ${subscription.sharesRequested} shares requested`);
      return;
    }

    onApprove(shares);
    setSharesAllocated('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setSharesAllocated('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
              <FiCheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Approve Subscription
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
        
        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {/* Subscription Info */}
          {(subscription.userName || subscription.emissionTitle) && (
            <div className="bg-muted/50 rounded-lg p-3 mb-4 text-sm">
              {subscription.userName && (
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">User:</span>
                  <span className="text-foreground font-medium">{subscription.userName}</span>
                </div>
              )}
              {subscription.emissionTitle && (
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Emission:</span>
                  <span className="text-foreground font-medium">{subscription.emissionTitle}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested:</span>
                <span className="text-foreground font-medium">
                  {subscription.sharesRequested.toLocaleString('nb-NO')} shares
                </span>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-3 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Input Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">
              Number of Shares to Allocate
            </label>
            <div className="relative">
              <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="number"
                value={sharesAllocated}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value > subscription.sharesRequested) {
                    setSharesAllocated(subscription.sharesRequested.toString());
                    setError(`Maximum ${subscription.sharesRequested} shares can be allocated`);
                  } else {
                    setSharesAllocated(e.target.value);
                    if (error) setError('');
                  }
                }}
                className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter number of shares"
                min="1"
                max={subscription.sharesRequested}
                required
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                Maximum: {subscription.sharesRequested.toLocaleString('nb-NO')} shares
              </p>
              {parseInt(sharesAllocated) === subscription.sharesRequested && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Full allocation
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!sharesAllocated || parseInt(sharesAllocated) <= 0 || parseInt(sharesAllocated) > subscription.sharesRequested}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white"
            >
              Approve
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}