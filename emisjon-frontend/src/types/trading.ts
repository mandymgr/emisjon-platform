// Trading System Types

export const OrderType = {
  BUY: 'BUY',
  SELL: 'SELL',
} as const;

export type OrderType = typeof OrderType[keyof typeof OrderType];

export const OrderStatus = {
  OPEN: 'OPEN',
  PARTIAL: 'PARTIAL',
  PARTIALLY_FILLED: 'PARTIALLY_FILLED',
  FILLED: 'FILLED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const TradeStatus = {
  PENDING: 'PENDING',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

export type TradeStatus = typeof TradeStatus[keyof typeof TradeStatus];

export const NotificationType = {
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_MATCHED: 'ORDER_MATCHED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_EXPIRED: 'ORDER_EXPIRED',
  TRADE_PENDING: 'TRADE_PENDING',
  TRADE_APPROVED: 'TRADE_APPROVED',
  TRADE_REJECTED: 'TRADE_REJECTED',
  SHARES_RECEIVED: 'SHARES_RECEIVED',
  SHARES_SOLD: 'SHARES_SOLD',
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface Shareholder {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  sharesOwned: number;
  totalShares: number;
  availableShares: number;
  lockedShares: number;
  sharesLockedForOrders: number;
  sharesAvailable: number;
  ownershipPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  shareholderId: string;
  shareholder?: Shareholder;
  userId: string;
  createdBy: string;
  type: OrderType;
  shares: number;
  quantity: number;
  pricePerShare: number;
  price: number;
  remainingQuantity: number;
  filledQuantity: number;
  status: OrderStatus;
  partialFill: boolean;
  timeLimit?: string;
  matchedAt?: string;
  completedAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  trades?: Trade[];
}

export interface Trade {
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  buyOrder?: Order;
  sellOrder?: Order;
  buyerShareholderId: string;
  sellerShareholderId: string;
  quantity: number;
  sharesTraded: number;
  price: number;
  pricePerShare: number;
  totalAmount: number;
  totalValue: number;
  approvedBy?: string;
  approvedById?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  status: TradeStatus;
  tradeType: 'FULL' | 'PARTIAL';
  declineReason?: string;
  approvedAt?: string;
  matchedAt: string;
  createdAt: string;
  completedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface OrderBook {
  buyOrders: Order[];
  sellOrders: Order[];
  spread: number | null;
}

export interface MarketDepth {
  bids: Array<{
    price: number;
    quantity: number;
    orders: number;
  }>;
  asks: Array<{
    price: number;
    quantity: number;
    orders: number;
  }>;
  totalBidVolume: number;
  totalAskVolume: number;
}

export interface TradingAnalytics {
  totalVolume: number;
  totalValue: number;
  totalTrades: number;
  averagePrice: number;
  dailyBreakdown: Record<string, {
    volume: number;
    value: number;
    trades: number;
  }>;
}

export interface PriceHistory {
  latestPrice: number | null;
  openPrice: number | null;
  highPrice: number | null;
  lowPrice: number | null;
  priceChange: number;
  priceChangePercent: number;
  priceHistory: Array<{
    timestamp: string;
    price: number;
    volume: number;
  }>;
}