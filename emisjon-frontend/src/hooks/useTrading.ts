import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tradingService } from '@/services/tradingService';
import type {
  CreateOrderInput,
  OrderFilterInput,
  ApproveTradeInput,
  RejectTradeInput,
  CancelOrderInput,
  MarketOrderFilterInput,
  TradeHistoryFilterInput,
  AnalyticsPeriod,
} from '@/lib/schemas/trading';
import {
  generateMockOrderBook,
  generateMockPriceHistory,
  generateMockVolumeAnalytics,
  generateMockLiquidityMetrics,
  generateMockMyOrders,
  generateMockTrades,
} from '@/lib/mockData';

// Order Hooks
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderInput) => tradingService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderBook'] });
      toast.success('Order created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create order');
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data?: CancelOrderInput }) =>
      tradingService.cancelOrder(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderBook'] });
      toast.success('Order cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to cancel order');
    },
  });
};

export const useMyOrders = (filters?: OrderFilterInput) => {
  return useQuery({
    queryKey: ['orders', 'my', filters],
    queryFn: async () => {
      try {
        const data = await tradingService.getMyOrders(filters);
        // If API returns empty, use mock data
        if (!data || data.length === 0) {
          return generateMockMyOrders();
        }
        return data;
      } catch (error) {
        // On error, return mock data
        return generateMockMyOrders();
      }
    },
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => tradingService.getOrderById(orderId),
    enabled: !!orderId,
  });
};

export const useMarketOrders = (filters?: MarketOrderFilterInput) => {
  return useQuery({
    queryKey: ['orders', 'market', filters],
    queryFn: () => tradingService.getMarketOrders(filters),
  });
};

export const useOrderBook = () => {
  return useQuery({
    queryKey: ['orderBook'],
    queryFn: async () => {
      try {
        const data = await tradingService.getOrderBook();
        // If API returns empty or no orders, use mock data
        if (!data || ((!data.buyOrders || data.buyOrders.length === 0) && (!data.sellOrders || data.sellOrders.length === 0))) {
          return generateMockOrderBook();
        }
        return data;
      } catch (error) {
        // On error, return mock data
        return generateMockOrderBook();
      }
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    placeholderData: (previousData) => previousData
  });
};

export const useMarketDepth = (levels: number = 5) => {
  return useQuery({
    queryKey: ['marketDepth', levels],
    queryFn: () => tradingService.getMarketDepth(levels),
    refetchInterval: 5000, // Refresh every 5 seconds
    placeholderData: (previousData) => previousData
  });
};

// Trade Hooks
export const usePendingTrades = () => {
  return useQuery({
    queryKey: ['trades', 'pending'],
    queryFn: async () => {
      try {
        const data = await tradingService.getPendingTrades();
        // If API returns empty, use mock data
        if (!data || data.length === 0) {
          return generateMockTrades().filter(t => t.status === 'PENDING_APPROVAL');
        }
        return data;
      } catch (error) {
        // On error, return mock data
        return generateMockTrades().filter(t => t.status === 'PENDING_APPROVAL');
      }
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    placeholderData: (previousData) => previousData
  });
};

export const useApproveTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tradeId, data }: { tradeId: string; data?: ApproveTradeInput }) =>
      tradingService.approveTrade(tradeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Trade approved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to approve trade');
    },
  });
};

export const useRejectTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tradeId, data }: { tradeId: string; data: RejectTradeInput }) =>
      tradingService.rejectTrade(tradeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Trade rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to reject trade');
    },
  });
};

export const useTradeHistory = (filters?: TradeHistoryFilterInput) => {
  return useQuery({
    queryKey: ['trades', 'history', filters],
    queryFn: () => tradingService.getTradeHistory(filters),
  });
};

export const useTrade = (tradeId: string) => {
  return useQuery({
    queryKey: ['trades', tradeId],
    queryFn: () => tradingService.getTradeById(tradeId),
    enabled: !!tradeId,
  });
};

// Analytics Hooks
export const useVolumeAnalytics = (period: AnalyticsPeriod = '7d', shareholderId?: string) => {
  return useQuery({
    queryKey: ['analytics', 'volume', period, shareholderId],
    queryFn: async () => {
      try {
        const data = await tradingService.getVolumeAnalytics(period, shareholderId);
        // If API returns empty, use mock data
        if (!data || !data.totalVolume) {
          return generateMockVolumeAnalytics();
        }
        return data;
      } catch (error) {
        // On error, return mock data
        return generateMockVolumeAnalytics();
      }
    },
  });
};

export const usePriceHistory = (period: AnalyticsPeriod = '7d') => {
  return useQuery({
    queryKey: ['analytics', 'price', period],
    queryFn: async () => {
      try {
        const data = await tradingService.getPriceHistory(period);
        // If API returns empty, use mock data
        if (!data || !data.latestPrice) {
          return generateMockPriceHistory();
        }
        return data;
      } catch (error) {
        // On error, return mock data
        return generateMockPriceHistory();
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    placeholderData: (previousData) => previousData
  });
};

export const useTopTraders = (period: AnalyticsPeriod = '30d', limit: number = 10) => {
  return useQuery({
    queryKey: ['analytics', 'topTraders', period, limit],
    queryFn: () => tradingService.getTopTraders(period, limit),
  });
};

export const useOrderStatusSummary = () => {
  return useQuery({
    queryKey: ['analytics', 'orderStatus'],
    queryFn: () => tradingService.getOrderStatusSummary(),
  });
};

export const useLiquidityMetrics = () => {
  return useQuery({
    queryKey: ['analytics', 'liquidity'],
    queryFn: async () => {
      try {
        const data = await tradingService.getLiquidityMetrics();
        // If API returns empty, use mock data
        if (!data || !data.liquidityScore) {
          return generateMockLiquidityMetrics();
        }
        return data;
      } catch (error) {
        // On error, return mock data
        return generateMockLiquidityMetrics();
      }
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};

// Notification Hooks
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => tradingService.getNotifications(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      tradingService.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => tradingService.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => tradingService.getUnreadNotificationCount(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};