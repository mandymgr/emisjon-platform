import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { AuthRequest, authenticate } from '../middleware/authMiddleware';
import { requireTradingAccess, setRequestMetadata } from '../middleware/tradingMiddleware';
import { tradingService } from '../services/tradingService';
import { matchingService } from '../services/matchingService';
import { OrderType, OrderStatus } from '@prisma/client';

const router: ExpressRouter = Router();

router.use(authenticate);
router.use(setRequestMetadata);

router.post('/create', requireTradingAccess, async (req: AuthRequest, res) => {
  try {
    const { shareholderId, type, quantity, price } = req.body;

    if (!shareholderId || !type || !quantity || !price) {
      return res.status(400).json({ 
        error: 'Missing required fields: shareholderId, type, quantity, price' 
      });
    }

    if (!Object.values(OrderType).includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid order type. Must be BUY or SELL' 
      });
    }

    if (quantity <= 0 || price <= 0) {
      return res.status(400).json({ 
        error: 'Quantity and price must be positive numbers' 
      });
    }

    const order = await tradingService.createOrder({
      shareholderId,
      type,
      quantity,
      price,
      userId: req.userId!,
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return res.status(400).json({ 
      error: error.message || 'Failed to create order' 
    });
  }
});

router.delete('/:orderId/cancel', requireTradingAccess, async (req: AuthRequest, res) => {
  try {
    const { orderId } = req.params;

    const order = await tradingService.cancelOrder(
      orderId,
      req.userId!,
      req.userRole!
    );

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to cancel order' 
    });
  }
});

router.get('/my-orders', requireTradingAccess, async (req: AuthRequest, res) => {
  try {
    const { status, type, shareholderId, fromDate, toDate } = req.query;

    const filters: any = {};
    
    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      filters.status = status as OrderStatus;
    }
    
    if (type && Object.values(OrderType).includes(type as OrderType)) {
      filters.type = type as OrderType;
    }
    
    if (shareholderId) {
      filters.shareholderId = shareholderId as string;
    }
    
    if (fromDate) {
      filters.fromDate = new Date(fromDate as string);
    }
    
    if (toDate) {
      filters.toDate = new Date(toDate as string);
    }

    const orders = await tradingService.getUserOrders(req.userId!, filters);

    res.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders' 
    });
  }
});

router.get('/market', async (req: AuthRequest, res) => {
  try {
    const { status, type, minPrice, maxPrice } = req.query;

    const filters: any = {};
    
    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      filters.status = status as OrderStatus;
    }
    
    if (type && Object.values(OrderType).includes(type as OrderType)) {
      filters.type = type as OrderType;
    }
    
    if (minPrice) {
      filters.minPrice = parseFloat(minPrice as string);
    }
    
    if (maxPrice) {
      filters.maxPrice = parseFloat(maxPrice as string);
    }

    const orders = await tradingService.getMarketOrders(filters);

    res.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error: any) {
    console.error('Error fetching market orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch market orders' 
    });
  }
});

router.get('/order-book', async (_req: AuthRequest, res) => {
  try {
    const orderBook = await tradingService.getOrderBook();

    res.json({
      success: true,
      data: orderBook,
    });
  } catch (error: any) {
    console.error('Error fetching order book:', error);
    res.status(500).json({ 
      error: 'Failed to fetch order book' 
    });
  }
});

router.get('/market-depth', async (req: AuthRequest, res) => {
  try {
    const levels = parseInt(req.query.levels as string) || 5;
    const marketDepth = await matchingService.getMarketDepth(levels);

    res.json({
      success: true,
      data: marketDepth,
    });
  } catch (error: any) {
    console.error('Error fetching market depth:', error);
    res.status(500).json({ 
      error: 'Failed to fetch market depth' 
    });
  }
});

router.get('/:orderId', requireTradingAccess, async (req: AuthRequest, res) => {
  try {
    const { orderId } = req.params;

    const order = await tradingService.getOrderById(
      orderId,
      req.userId!,
      req.userRole!
    );

    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found' 
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return res.status(400).json({ 
      error: error.message || 'Failed to fetch order' 
    });
  }
});

router.get('/:orderId/matching', requireTradingAccess, async (req: AuthRequest, res) => {
  try {
    const { orderId } = req.params;

    const matchingOrders = await matchingService.getMatchingOrders(orderId);

    res.json({
      success: true,
      data: matchingOrders,
      count: matchingOrders.length,
    });
  } catch (error: any) {
    console.error('Error fetching matching orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch matching orders' 
    });
  }
});

router.get('/best-price/:type', async (req: AuthRequest, res) => {
  try {
    const { type } = req.params;

    if (!Object.values(OrderType).includes(type as OrderType)) {
      return res.status(400).json({ 
        error: 'Invalid order type. Must be BUY or SELL' 
      });
    }

    const bestPrice = await matchingService.calculateBestPrice(type as OrderType);

    return res.json({
      success: true,
      data: {
        type,
        bestPrice,
      },
    });
  } catch (error: any) {
    console.error('Error calculating best price:', error);
    return res.status(500).json({ 
      error: 'Failed to calculate best price' 
    });
  }
});

export default router;