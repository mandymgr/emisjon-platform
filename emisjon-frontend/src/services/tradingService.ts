import axiosInstance from '@/lib/axios';
import type {
  Order,
  Trade,
  OrderBook,
  MarketDepth,
  TradingAnalytics,
  PriceHistory,
  Notification,
} from '@/types/trading';
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

class TradingService {
  // Order Management
  async createOrder(data: CreateOrderInput): Promise<Order> {
    const response = await axiosInstance.post('/api/orders/create', data);
    return response.data.data;
  }

  async cancelOrder(orderId: string, data?: CancelOrderInput): Promise<Order> {
    const response = await axiosInstance.delete(`/api/orders/${orderId}/cancel`, { data });
    return response.data.data;
  }

  async getMyOrders(filters?: OrderFilterInput): Promise<Order[]> {
    const response = await axiosInstance.get('/api/orders/my-orders', { params: filters });
    return response.data.data;
  }

  async getOrderById(orderId: string): Promise<Order> {
    const response = await axiosInstance.get(`/api/orders/${orderId}`);
    return response.data.data;
  }

  async getMarketOrders(filters?: MarketOrderFilterInput): Promise<Order[]> {
    const response = await axiosInstance.get('/api/orders/market', { params: filters });
    return response.data.data;
  }

  async getOrderBook(): Promise<OrderBook> {
    const response = await axiosInstance.get('/api/orders/order-book');
    return response.data.data;
  }

  async getMarketDepth(levels: number = 5): Promise<MarketDepth> {
    const response = await axiosInstance.get('/api/orders/market-depth', { params: { levels } });
    return response.data.data;
  }

  async getMatchingOrders(orderId: string): Promise<Order[]> {
    const response = await axiosInstance.get(`/api/orders/${orderId}/matching`);
    return response.data.data;
  }

  async getBestPrice(type: 'BUY' | 'SELL'): Promise<number | null> {
    const response = await axiosInstance.get(`/api/orders/best-price/${type}`);
    return response.data.data.bestPrice;
  }

  // Trade Management
  async getPendingTrades(): Promise<Trade[]> {
    const response = await axiosInstance.get('/api/trades/pending');
    return response.data.data;
  }

  async approveTrade(tradeId: string, data?: ApproveTradeInput): Promise<Trade> {
    const response = await axiosInstance.post(`/api/trades/${tradeId}/approve`, data);
    return response.data.data;
  }

  async rejectTrade(tradeId: string, data: RejectTradeInput): Promise<Trade> {
    const response = await axiosInstance.post(`/api/trades/${tradeId}/reject`, data);
    return response.data.data;
  }

  async getTradeHistory(filters?: TradeHistoryFilterInput): Promise<Trade[]> {
    const response = await axiosInstance.get('/api/trades/history', { params: filters });
    return response.data.data;
  }

  async getTradeById(tradeId: string): Promise<Trade> {
    const response = await axiosInstance.get(`/api/trades/${tradeId}`);
    return response.data.data;
  }

  // Analytics
  async getVolumeAnalytics(
    period: AnalyticsPeriod = '7d',
    shareholderId?: string
  ): Promise<TradingAnalytics> {
    const response = await axiosInstance.get('/api/analytics/volume', {
      params: { period, shareholderId },
    });
    return response.data.data;
  }

  async getPriceHistory(period: AnalyticsPeriod = '7d'): Promise<PriceHistory> {
    const response = await axiosInstance.get('/api/analytics/price-history', {
      params: { period },
    });
    return response.data.data;
  }

  async getTopTraders(
    period: AnalyticsPeriod = '30d',
    limit: number = 10
  ): Promise<{
    topBuyers: Array<{
      shareholderId: string;
      shareholderName: string;
      totalVolume: number;
      totalValue: number;
      totalTrades: number;
    }>;
    topSellers: Array<{
      shareholderId: string;
      shareholderName: string;
      totalVolume: number;
      totalValue: number;
      totalTrades: number;
    }>;
  }> {
    const response = await axiosInstance.get('/api/analytics/top-traders', {
      params: { period, limit },
    });
    return response.data.data;
  }

  async getOrderStatusSummary(): Promise<Record<string, any>> {
    const response = await axiosInstance.get('/api/analytics/order-status-summary');
    return response.data.data;
  }

  async getLiquidityMetrics(): Promise<{
    bidVolume: number;
    askVolume: number;
    bidOrderCount: number;
    askOrderCount: number;
    liquidityScore: number;
    marketDepth: number;
    priceVolatility: number;
    volumeImbalance: number;
  }> {
    const response = await axiosInstance.get('/api/analytics/liquidity-metrics');
    return response.data.data;
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const response = await axiosInstance.get('/api/notifications');
    return response.data.data;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await axiosInstance.patch(`/api/notifications/${notificationId}/read`);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await axiosInstance.patch('/api/notifications/read-all');
  }

  async getUnreadNotificationCount(): Promise<number> {
    const response = await axiosInstance.get('/api/notifications/unread-count');
    return response.data.count;
  }
}

export const tradingService = new TradingService();