import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import shareholderRoutes from './routes/shareholderRoutes';
import emissionRoutes from './routes/emissionRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import snapshotRoutes from './routes/snapshotRoutes';
import orderRoutes from './routes/orderRoutes';
import tradeRoutes from './routes/tradeRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Trust proxy for Vercel deployment
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Minimal CORS configuration - requests come through proxy as same-origin
const corsOptions = {
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:5173', 'http://localhost:5174'] // For direct development access
    : false, // In production, all requests come through the proxy
  credentials: true,
};

// Apply CORS before any other middleware
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shareholders', shareholderRoutes);
app.use('/api/emissions', emissionRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/snapshots', snapshotRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

export default app;