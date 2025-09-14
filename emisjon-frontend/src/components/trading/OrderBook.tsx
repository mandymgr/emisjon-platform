// import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrderBook } from '@/hooks/useTrading';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, RefreshCw, TestTube } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderBookProps {
  onSelectOrder?: (order: any) => void;
  className?: string;
}

export function OrderBook({ onSelectOrder, className }: OrderBookProps) {
  const { data: orderBook, isLoading, isFetching } = useOrderBook();

  // Only show skeleton on initial load, not on refetch
  if (isLoading && !orderBook) {
    return <OrderBookSkeleton />;
  }

  if (!orderBook) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader className="pb-3">
          <CardTitle>Order Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No market data available</p>
            <p className="text-xs mt-2">Waiting for orders...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { buyOrders, sellOrders, spread } = orderBook;
  // Check if this is mock data (all orders have IDs starting with 'mock-')
  const isMockData = buyOrders.some(o => o.id?.startsWith('mock-')) || sellOrders.some(o => o.id?.startsWith('mock-'));

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base sm:text-lg">Order Book</CardTitle>
            {isFetching && (
              <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
            {isMockData && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <TestTube className="h-3 w-3" />
                <span className="hidden sm:inline">Demo Data</span>
                <span className="sm:hidden">Demo</span>
              </Badge>
            )}
          </div>
          {spread !== null && (
            <Badge variant="outline" className="font-mono text-xs sm:text-sm">
              <span className="hidden sm:inline">Spread: </span>
              <span className="sm:hidden">S: </span>
              {formatCurrency(spread)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
          {/* Buy Orders */}
          <div className="relative rounded-lg bg-card">
            <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 via-green-50/20 to-transparent dark:from-green-950/30 dark:via-green-950/10 dark:to-transparent rounded-lg pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  <span className="hidden sm:inline">Buy Orders</span>
                  <span className="sm:hidden">Buy</span>
                </h3>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {buyOrders.length} orders
                </span>
              </div>
              <div className="w-full">
                <div className="space-y-1 px-2">
                {buyOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No buy orders
                  </div>
                ) : (
                  buyOrders.slice(0, 5).map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      type="buy"
                      onClick={() => onSelectOrder?.(order)}
                    />
                  ))
                )}
                </div>
              </div>
            </div>
          </div>

          {/* Sell Orders */}
          <div className="relative rounded-lg bg-card">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-100/50 via-gray-50/30 to-transparent dark:from-gray-800/30 dark:via-gray-900/10 dark:to-transparent rounded-lg pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400" />
                  <span className="hidden sm:inline">Sell Orders</span>
                  <span className="sm:hidden">Sell</span>
                </h3>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {sellOrders.length} orders
                </span>
              </div>
              <div className="w-full">
                <div className="space-y-1 px-2">
                {sellOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No sell orders
                  </div>
                ) : (
                  sellOrders.slice(0, 5).map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      type="sell"
                      onClick={() => onSelectOrder?.(order)}
                    />
                  ))
                )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

interface OrderRowProps {
  order: any;
  type: 'buy' | 'sell';
  onClick?: () => void;
}

function OrderRow({ order, type, onClick }: OrderRowProps) {
  const price = order.pricePerShare || order.price;
  const quantity = order.remainingQuantity || order.quantity || order.shares;
  const total = price * quantity;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-2 py-1.5 rounded text-left transition-all duration-200',
        'hover:scale-[1.02] hover:shadow-sm',
        type === 'buy' 
          ? 'hover:bg-green-100/50 dark:hover:bg-green-900/20' 
          : 'hover:bg-gray-200/50 dark:hover:bg-gray-800/20',
        'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary',
        'animate-in fade-in-0 duration-300'
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs sm:text-sm">{formatCurrency(price)}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">{quantity}</span>
          </div>
          <div className="flex justify-between items-center mt-0.5">
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              Total: {formatCurrency(total)}
            </span>
            {order.partialFill && (
              <Badge variant="secondary" className="text-xs scale-90">
                Partial
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function OrderBookSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}