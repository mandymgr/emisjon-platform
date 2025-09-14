import { Order, Trade, Shareholder, Prisma } from '@prisma/client';

// Extended Order type with additional fields for compatibility
export type ExtendedOrder = Order & {
  shareholderId?: string;
  quantity?: number;
  price?: number | Prisma.Decimal;
  remainingQuantity?: number;
  filledQuantity?: number;
}

// Extended Trade type with additional fields for compatibility
export type ExtendedTrade = Trade & {
  buyerShareholderId?: string;
  sellerShareholderId?: string;
  quantity?: number;
  price?: number | Prisma.Decimal;
  totalAmount?: number | Prisma.Decimal;
  matchedAt?: Date;
}

// Extended Shareholder type with additional fields
export type ExtendedShareholder = Shareholder & {
  totalShares?: number;
  availableShares?: number;
}

// Helper functions to convert between types
export function toExtendedOrder(order: Order): ExtendedOrder {
  return {
    ...order,
    shareholderId: (order as any).shareholderId,
    quantity: order.shares,
    price: order.pricePerShare,
    remainingQuantity: (order as any).remainingQuantity || order.shares,
    filledQuantity: (order as any).filledQuantity || 0,
  };
}

export function toExtendedTrade(trade: Trade): ExtendedTrade {
  return {
    ...trade,
    buyerShareholderId: (trade as any).buyerShareholderId,
    sellerShareholderId: (trade as any).sellerShareholderId,
    quantity: trade.sharesTraded,
    price: trade.pricePerShare,
    totalAmount: trade.totalValue,
    matchedAt: (trade as any).matchedAt || trade.createdAt,
  };
}

export function toExtendedShareholder(shareholder: Shareholder): ExtendedShareholder {
  return {
    ...shareholder,
    totalShares: shareholder.sharesOwned,
    availableShares: shareholder.sharesAvailable,
  };
}