import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign,
  Eye,
  Lock,
  AlertCircle
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { 
  useOrderBook, 
  useMyOrders, 
  usePriceHistory,
  useVolumeAnalytics,
  useLiquidityMetrics
} from '@/hooks/useTrading';
import { OrderBook } from './OrderBook';
import { CreateOrderDialog } from './CreateOrderDialog';
import { formatCurrency, cn } from '@/lib/utils';
import { OrderStatus, OrderType } from '@/types/trading';

interface TradingDashboardProps {
  shareholders?: Array<{
    id: string;
    name: string;
    email?: string;
    userId?: string;
    sharesOwned?: number;
    availableShares?: number;
  }>;
}

export function TradingDashboard({ shareholders = [] }: TradingDashboardProps) {
  const { user } = useAppSelector(state => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  const userLevel = user?.level || 1;

  // Access control helpers
  const getUserLevelString = () => {
    if (!user) return 'Guest';
    if (isAdmin) {
      return 'Admin';
    }
    return `User L${user.level}`;
  };

  const hasUserL2Access = () => userLevel >= 2;
  const canTrade = () => isAdmin || userLevel >= 3;

  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [selectedOrderType, setSelectedOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [isBlurred, setIsBlurred] = useState(!hasUserL2Access());
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { data: orderBook, isLoading: orderBookLoading } = useOrderBook();
  const { data: myOrders, isLoading: myOrdersLoading } = useMyOrders();
  const { data: priceHistory, isLoading: priceHistoryLoading } = usePriceHistory('24h');
  const { data: volumeAnalytics, isLoading: volumeLoading } = useVolumeAnalytics('7d');
  const { data: liquidityMetrics } = useLiquidityMetrics();

  React.useEffect(() => {
    // Check if initial data has loaded
    if (!orderBookLoading && !priceHistoryLoading && !volumeLoading) {
      setIsInitialLoading(false);
    }
  }, [orderBookLoading, priceHistoryLoading, volumeLoading]);

  const userLevelString = getUserLevelString();
  const canPlaceOrders = canTrade();
  
  // Filter shareholders for level 3 users - they can only trade their own shares
  const filteredShareholders = React.useMemo(() => {
    if (!user) return [];
    
    // Admin users can see all shareholders
    if (isAdmin) {
      return shareholders;
    }
    
    // Level 3 users can only see their own shares
    if (userLevel === 3) {
      // Filter by userId, email, or name match
      return shareholders.filter(s => {
        // Check if any of these fields match the current user
        const userIdMatch = s.userId && s.userId === user.id;
        const emailMatch = s.email && user.email && s.email.toLowerCase() === user.email.toLowerCase();
        const nameMatch = s.name && user.name && s.name.toLowerCase() === user.name.toLowerCase();
        
        return userIdMatch || emailMatch || nameMatch;
      });
    }
    
    return shareholders;
  }, [shareholders, user, isAdmin, userLevel]);

  const handleCreateOrder = (type: 'BUY' | 'SELL') => {
    if (!canPlaceOrders) {
      return;
    }
    setSelectedOrderType(type);
    setShowCreateOrder(true);
  };

  const activeOrders = myOrders?.filter(order => 
    [OrderStatus.OPEN, OrderStatus.PARTIAL, OrderStatus.PARTIALLY_FILLED].includes(order.status as any)
  );

  const completedOrders = myOrders?.filter(order => 
    [OrderStatus.FILLED, OrderStatus.CANCELLED, OrderStatus.EXPIRED].includes(order.status as any)
  );

  if (!hasUserL2Access()) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Trading Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Limited Access</AlertTitle>
            <AlertDescription>
              You have {userLevelString} access. Upgrade to User L2 or higher to view the order book,
              or to User L3 to start trading.
            </AlertDescription>
          </Alert>

          <div className="mt-6 space-y-4">
            <Card className={cn("relative overflow-hidden", isBlurred && "cursor-pointer")}
                  onClick={() => !isBlurred && setIsBlurred(true)}>
              <div className={cn(
                "transition-all duration-300",
                isBlurred && "blur-md select-none pointer-events-none"
              )}>
                <CardHeader>
                  <CardTitle className="text-lg">Market Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Latest Price</p>
                      <p className="text-2xl font-bold">NOK 125.50</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">24h Volume</p>
                      <p className="text-2xl font-bold">15,234</p>
                    </div>
                  </div>
                </CardContent>
              </div>
              {isBlurred && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <Button variant="outline" onClick={(e) => {
                    e.stopPropagation();
                    setIsBlurred(false);
                  }}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Market Data
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show skeleton loader on initial load
  if (isInitialLoading) {
    return <TradingDashboardSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight">Trading Dashboard</h2>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">
            Real-time market data and trading interface
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {canPlaceOrders && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => handleCreateOrder('BUY')}
                variant="default"
                className="font-semibold shadow-lg hover:shadow-xl transition-all flex-1 sm:flex-initial"
              >
                <Plus className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Buy Order</span>
                <span className="sm:hidden">Buy</span>
              </Button>
              <Button
                onClick={() => handleCreateOrder('SELL')}
                variant="outline"
                className="font-semibold shadow-lg hover:shadow-xl transition-all flex-1 sm:flex-initial"
              >
                <Plus className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Sell Order</span>
                <span className="sm:hidden">Sell</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {!canPlaceOrders && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Read-Only Access</AlertTitle>
          <AlertDescription>
            You have {userLevelString} access. You can view the order book but cannot place orders.
            Upgrade to User L3 or Admin to start trading.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Current Price</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {priceHistory?.latestPrice ? formatCurrency(priceHistory.latestPrice) : '-'}
            </div>
            {priceHistory?.priceChangePercent !== undefined && (
              <p className={cn(
                "text-xs flex items-center",
                priceHistory.priceChangePercent >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {priceHistory.priceChangePercent >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(priceHistory.priceChangePercent).toFixed(2)}%
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">24h Volume</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {volumeAnalytics?.totalVolume?.toLocaleString() || '0'}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              shares traded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Bid/Ask Spread</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {orderBook?.spread ? formatCurrency(orderBook.spread) : '-'}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              current spread
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Liquidity</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {(liquidityMetrics as any)?.liquidityScore?.toFixed(2) || '-'}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              liquidity ratio
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <OrderBook />
        </div>

        <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
          {canPlaceOrders && (
            <Card>
              <CardHeader>
                <CardTitle>My Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active">
                      Active ({activeOrders?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="history">
                      History ({completedOrders?.length || 0})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="active" className="space-y-2">
                    {myOrdersLoading ? (
                      <OrderListSkeleton />
                    ) : activeOrders?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No active orders
                      </div>
                    ) : (
                      (() => {
                        const buyOrder = activeOrders?.find(order => order.type === 'BUY');
                        const sellOrder = activeOrders?.find(order => order.type === 'SELL');
                        const ordersToShow = [buyOrder, sellOrder].filter(Boolean).slice(0, 2);
                        return ordersToShow.map((order) => (
                          <OrderCard key={order!.id} order={order!} />
                        ));
                      })()
                    )}
                  </TabsContent>
                  
                  <TabsContent value="history" className="space-y-2">
                    {myOrdersLoading ? (
                      <OrderListSkeleton />
                    ) : completedOrders?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No order history
                      </div>
                    ) : (
                      completedOrders?.slice(0, 5).map((order) => (
                        <OrderCard key={order.id} order={order} />
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {canPlaceOrders && (
        <CreateOrderDialog
          open={showCreateOrder}
          onOpenChange={setShowCreateOrder}
          defaultType={selectedOrderType}
          shareholders={filteredShareholders}
        />
      )}
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const statusColors = {
    [OrderStatus.OPEN]: 'bg-blue-500',
    [OrderStatus.PARTIAL]: 'bg-yellow-500',
    [OrderStatus.PARTIALLY_FILLED]: 'bg-yellow-500',
    [OrderStatus.FILLED]: 'bg-green-500',
    [OrderStatus.CANCELLED]: 'bg-gray-500',
    [OrderStatus.EXPIRED]: 'bg-red-500',
  };

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge 
              variant={order.type === OrderType.BUY ? 'default' : 'secondary'}
              className={cn(
                "text-xs",
                order.type === OrderType.SELL && "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
              )}
            >
              {order.type}
            </Badge>
            <span className="text-sm font-medium">
              {order.quantity || order.shares} @ {formatCurrency(order.pricePerShare || order.price)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", statusColors[order.status as keyof typeof statusColors])} />
            <span className="text-xs text-muted-foreground">{order.status}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">
            {formatCurrency((order.quantity || order.shares) * (order.pricePerShare || order.price))}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Card>
  );
}

function OrderListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

function TradingDashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Order Book Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 mb-2" />
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 mb-2" />
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Orders Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <OrderListSkeleton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}