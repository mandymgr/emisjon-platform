import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  User,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { usePendingTrades, useApproveTrade, useRejectTrade } from '@/hooks/useTrading';
import { formatCurrency, cn } from '@/lib/utils';
import { TradeStatus } from '@/types/trading';
import type { Trade } from '@/types/trading';
import { format } from 'date-fns';

export function AdminApprovalPanel() {
  const { user } = useAppSelector(state => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  const userLevel = user?.level || 1;
  const canApprove = () => isAdmin && userLevel >= 2;
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingTradeId, setProcessingTradeId] = useState<string | null>(null);

  const { data: pendingTrades, isLoading } = usePendingTrades();
  const approveTrade = useApproveTrade();
  const rejectTrade = useRejectTrade();

  if (!canApprove()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Approval Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              Only Admin users can access the approval panel.
              You need elevated admin privileges to approve or reject trades.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handleApprove = async (trade: any) => {
    if (processingTradeId) return;
    
    setProcessingTradeId(trade.id);
    try {
      await approveTrade.mutateAsync({
        tradeId: trade.id,
        data: { notes: `Approved by ${user?.name}` }
      });
      setSelectedTrade(null);
    } finally {
      setProcessingTradeId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedTrade || !rejectionReason.trim() || processingTradeId) return;
    
    setProcessingTradeId(selectedTrade.id);
    try {
      await rejectTrade.mutateAsync({
        tradeId: selectedTrade.id,
        data: { reason: rejectionReason }
      });
      setShowRejectDialog(false);
      setSelectedTrade(null);
      setRejectionReason('');
    } finally {
      setProcessingTradeId(null);
    }
  };

  const openRejectDialog = (trade: any) => {
    setSelectedTrade(trade);
    setShowRejectDialog(true);
  };

  if (isLoading) {
    return <PanelSkeleton />;
  }

  const pendingCount = pendingTrades?.filter(t => t.status === TradeStatus.PENDING_APPROVAL).length || 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Admin Approval Panel</span>
              <span className="sm:hidden">Admin Panel</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={pendingCount > 0 ? "destructive" : "secondary"} className="text-xs">
                {pendingCount} Pending
              </Badge>
              <Badge variant="outline" className="text-xs">Admin</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pendingCount === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">
                No trades pending approval at the moment.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-auto max-h-[500px] pr-2 sm:pr-4">
              <div className="space-y-4">
                {pendingTrades?.map((trade) => (
                  <TradeApprovalCard
                    key={trade.id}
                    trade={trade}
                    onApprove={() => handleApprove(trade)}
                    onReject={() => openRejectDialog(trade)}
                    isProcessing={processingTradeId === trade.id}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Trade</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this trade. This will be recorded
              and visible to the involved parties.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTrade && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trade ID:</span>
                  <span className="font-mono">{selectedTrade.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">
                    {selectedTrade.quantity} shares @ {formatCurrency(selectedTrade.pricePerShare)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Value:</span>
                  <span className="font-semibold">{formatCurrency(selectedTrade.totalValue)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter the reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
              }}
              disabled={processingTradeId === selectedTrade?.id}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || processingTradeId === selectedTrade?.id}
            >
              {processingTradeId === selectedTrade?.id ? 'Rejecting...' : 'Reject Trade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface TradeApprovalCardProps {
  trade: any;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}

function TradeApprovalCard({ trade, onApprove, onReject, isProcessing }: TradeApprovalCardProps) {
  const isCritical = trade.quantity > 1000 || trade.totalValue > 100000;

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      isCritical && "border-orange-500"
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] sm:text-xs">
                {trade.id.slice(0, 8)}
              </Badge>
              {isCritical && (
                <Badge variant="destructive" className="text-[10px] sm:text-xs">
                  High Value
                </Badge>
              )}
              <Badge variant="secondary" className="text-[10px] sm:text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {format(new Date(trade.matchedAt), 'HH:mm:ss')}
              </Badge>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {format(new Date(trade.matchedAt), 'dd MMM yyyy')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium">Buyer</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    ID: {trade.buyerShareholderId.slice(0, 8)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium">Seller</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    ID: {trade.sellerShareholderId.slice(0, 8)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center py-2">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="rounded-lg bg-muted p-2 sm:p-3 space-y-1 sm:space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-muted-foreground">Quantity:</span>
              <span className="text-xs sm:text-sm font-semibold">{trade.quantity} shares</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-muted-foreground">Price per Share:</span>
              <span className="text-xs sm:text-sm font-semibold">{formatCurrency(trade.pricePerShare)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-muted-foreground">Total Value:</span>
              <span className="text-sm sm:text-lg font-bold">{formatCurrency(trade.totalValue)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1 text-xs sm:text-sm"
              size="sm"
              onClick={onApprove}
              disabled={isProcessing}
            >
              <CheckCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {isProcessing ? 'Processing...' : 'Approve'}
            </Button>
            <Button
              className="flex-1 text-xs sm:text-sm"
              size="sm"
              variant="destructive"
              onClick={onReject}
              disabled={isProcessing}
            >
              <XCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PanelSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}