import { z } from 'zod';

// Order creation schema
export const createOrderSchema = z.object({
  shareholderId: z.string().min(1, 'Shareholder is required'),
  type: z.enum(['BUY', 'SELL'], {
    errorMap: () => ({ message: 'Please select order type' }),
  }),
  quantity: z
    .number()
    .min(1, 'Quantity must be at least 1')
    .int('Quantity must be a whole number'),
  price: z
    .number()
    .min(0.01, 'Price must be greater than 0')
    .multipleOf(0.01, 'Price can have maximum 2 decimal places'),
  partialFill: z.boolean().default(false),
  timeLimit: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// Order filter schema
export const orderFilterSchema = z.object({
  status: z.enum(['OPEN', 'PARTIAL', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'EXPIRED']).optional(),
  type: z.enum(['BUY', 'SELL']).optional(),
  shareholderId: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export type OrderFilterInput = z.infer<typeof orderFilterSchema>;

// Trade approval schema
export const approveTradeSchema = z.object({
  notes: z.string().optional(),
});

export type ApproveTradeInput = z.infer<typeof approveTradeSchema>;

// Trade rejection schema
export const rejectTradeSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
  notes: z.string().optional(),
});

export type RejectTradeInput = z.infer<typeof rejectTradeSchema>;

// Order cancellation schema
export const cancelOrderSchema = z.object({
  reason: z.string().optional(),
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

// Market order filter schema
export const marketOrderFilterSchema = z.object({
  status: z.enum(['OPEN', 'PARTIAL', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'EXPIRED']).optional(),
  type: z.enum(['BUY', 'SELL']).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});

export type MarketOrderFilterInput = z.infer<typeof marketOrderFilterSchema>;

// Trade history filter schema
export const tradeHistoryFilterSchema = z.object({
  shareholderId: z.string().optional(),
  status: z.enum(['PENDING', 'PENDING_APPROVAL', 'COMPLETED', 'REJECTED', 'CANCELLED']).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export type TradeHistoryFilterInput = z.infer<typeof tradeHistoryFilterSchema>;

// Analytics period schema
export const analyticsPeriodSchema = z.enum(['24h', '7d', '30d', '90d']);

export type AnalyticsPeriod = z.infer<typeof analyticsPeriodSchema>;