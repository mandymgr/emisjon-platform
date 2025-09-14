import app from './app';
import { config } from './config/env';
import prisma from './config/database';
import { tradingService } from './services/tradingService';

// Order expiration scheduler
let orderExpirationInterval: NodeJS.Timeout;

const startOrderExpirationScheduler = () => {
  // Run immediately on startup
  tradingService.expireOldOrders()
    .then(count => {
      if (count > 0) {
        console.log(`[Order Expiration] Expired ${count} orders on startup`);
      }
    })
    .catch(error => {
      console.error('[Order Expiration] Error on startup:', error);
    });

  // Then run every 5 minutes (300000 ms)
  orderExpirationInterval = setInterval(async () => {
    try {
      const expiredCount = await tradingService.expireOldOrders();
      if (expiredCount > 0) {
        console.log(`[Order Expiration] Expired ${expiredCount} orders`);
      }
    } catch (error) {
      console.error('[Order Expiration] Error during scheduled run:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes

  console.log('Order expiration scheduler started (runs every 5 minutes)');
};

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
      
      // Start the order expiration scheduler after server starts
      startOrderExpirationScheduler();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  if (orderExpirationInterval) {
    clearInterval(orderExpirationInterval);
    console.log('Order expiration scheduler stopped');
  }
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  if (orderExpirationInterval) {
    clearInterval(orderExpirationInterval);
    console.log('Order expiration scheduler stopped');
  }
  await prisma.$disconnect();
  process.exit(0);
});

startServer();