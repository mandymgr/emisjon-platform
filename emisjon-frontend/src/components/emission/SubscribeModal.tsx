import { useState } from 'react';
import { FiX, FiHash } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useNorwegianNumber } from '@/hooks/useNorwegianFormat';
import * as subscriptionService from '@/services/subscriptionService';

interface SubscribeModalProps {
  isOpen: boolean;
  emission: {
    id: string;
    title: string;
    pricePerShare: number;
    newSharesOffered: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubscribeModal({ 
  isOpen, 
  emission, 
  onClose, 
  onSuccess 
}: SubscribeModalProps) {
  const [sharesRequested, setSharesRequested] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { formatCurrency } = useNorwegianNumber();

  if (!isOpen) return null;

  const totalAmount = Number(sharesRequested) * emission.pricePerShare;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const shares = Number(sharesRequested);
    if (!shares || shares <= 0) {
      setError('Please enter a valid number of shares');
      return;
    }

    if (shares > emission.newSharesOffered) {
      setError('Cannot request more shares than offered');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await subscriptionService.createSubscription({
        emissionId: emission.id,
        sharesRequested: shares
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-card rounded-lg shadow-xl border border-border p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-card-foreground">
            Subscribe to Emission
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-card-foreground transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Emission Info */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-card-foreground mb-2">{emission.title}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price per share:</span>
              <span className="text-card-foreground font-medium">
                {formatCurrency(emission.pricePerShare)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shares available:</span>
              <span className="text-card-foreground font-medium">
                {emission.newSharesOffered.toLocaleString('nb-NO')}
              </span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">
              Number of Shares to Request
            </label>
            <div className="relative">
              <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="number"
                value={sharesRequested}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value > emission.newSharesOffered) {
                    setSharesRequested(emission.newSharesOffered.toString());
                    setError(`Maximum ${emission.newSharesOffered} shares available`);
                  } else {
                    setSharesRequested(e.target.value);
                    if (error) setError('');
                  }
                }}
                className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter number of shares"
                min="1"
                max={emission.newSharesOffered}
                required
                disabled={loading}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                Maximum: {emission.newSharesOffered.toLocaleString('nb-NO')} shares
              </p>
              {Number(sharesRequested) === emission.newSharesOffered && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Maximum reached
                </span>
              )}
            </div>
          </div>

          {/* Total Amount */}
          {sharesRequested && Number(sharesRequested) > 0 && (
            <div className="bg-primary/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Amount:</span>
                <div className="text-right">
                  <div className="text-xl font-bold text-card-foreground">
                    {formatCurrency(totalAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Number(sharesRequested).toLocaleString('nb-NO')} shares × {formatCurrency(emission.pricePerShare)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !sharesRequested || Number(sharesRequested) > emission.newSharesOffered || Number(sharesRequested) <= 0}
              className="flex-1"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </div>
        </form>

        {/* Notice */}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Your subscription request will be reviewed by an administrator
        </p>
      </div>
    </div>
  );
}