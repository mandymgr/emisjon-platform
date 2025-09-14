// Mock data for development/demo purposes
import { OrderType, OrderStatus } from '@/types/trading';

export const generateMockOrderBook = () => {
  const generateOrder = (type: 'BUY' | 'SELL', index: number) => ({
    id: `mock-${type}-${index}`,
    type: type === 'BUY' ? OrderType.BUY : OrderType.SELL,
    price: type === 'BUY' 
      ? 125 - (index * 0.5) 
      : 126 + (index * 0.5),
    quantity: Math.floor(Math.random() * 500) + 100,
    shareholderId: `shareholder-${Math.floor(Math.random() * 4) + 1}`,
    status: OrderStatus.OPEN,
    createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  });

  return {
    buyOrders: Array.from({ length: 8 }, (_, i) => generateOrder('BUY', i)),
    sellOrders: Array.from({ length: 8 }, (_, i) => generateOrder('SELL', i)),
    spread: 1.0,
  };
};

export const generateMockPriceHistory = () => ({
  latestPrice: 125.50,
  priceChangePercent: 2.35,
  high24h: 128.00,
  low24h: 122.50,
  volume24h: 15234,
});

export const generateMockVolumeAnalytics = () => ({
  totalVolume: 45678,
  averageVolume: 6525,
  volumeTrend: 'increasing',
});

export const generateMockLiquidityMetrics = () => ({
  liquidityRatio: 1.85,
  bidAskRatio: 1.12,
  marketDepth: 23456,
});

export const generateMockTrades = () => {
  const statuses = ['PENDING_APPROVAL', 'APPROVED', 'EXECUTED', 'SETTLED'];
  
  return Array.from({ length: 5 }, (_, i) => ({
    id: `trade-${i}`,
    buyerShareholderId: `shareholder-${i % 3 + 1}`,
    sellerShareholderId: `shareholder-${(i + 1) % 3 + 1}`,
    quantity: Math.floor(Math.random() * 300) + 50,
    pricePerShare: 125 + (Math.random() * 4 - 2),
    totalValue: 0, // Will be calculated
    status: statuses[Math.floor(Math.random() * statuses.length)],
    matchedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  })).map(trade => ({
    ...trade,
    totalValue: trade.quantity * trade.pricePerShare,
  }));
};

export const generateMockMyOrders = () => {
  const types = [OrderType.BUY, OrderType.SELL];
  const statuses = [OrderStatus.OPEN, OrderStatus.PARTIAL, OrderStatus.FILLED, OrderStatus.CANCELLED];
  
  return Array.from({ length: 6 }, (_, i) => ({
    id: `my-order-${i}`,
    type: types[i % 2],
    price: 125 + (Math.random() * 6 - 3),
    quantity: Math.floor(Math.random() * 200) + 50,
    filledQuantity: Math.floor(Math.random() * 100),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    shareholderId: 'current-user',
    createdAt: new Date(Date.now() - Math.random() * 172800000).toISOString(),
  }));
};