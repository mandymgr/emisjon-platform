import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export function requireTradingAccess(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const userLevel = req.userLevel || 0;
  if (userLevel < 1) {
    res.status(403).json({ error: 'Trading access requires user level 1 or higher' });
    return;
  }

  next();
}

export function requireTradeApprovalAccess(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.userRole !== 'ADMIN' || (req.userLevel || 0) < 2) {
    res.status(403).json({ error: 'Trade approval requires Admin level 2 or higher' });
    return;
  }

  next();
}

export function requireAnalyticsAccess(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const isAdmin = req.userRole === 'ADMIN';
  const hasLevel2 = (req.userLevel || 0) >= 2;

  if (!isAdmin && !hasLevel2) {
    res.status(403).json({ error: 'Analytics access requires Admin role or user level 2+' });
    return;
  }

  next();
}

export function requireComplianceAccess(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.userRole !== 'ADMIN' || (req.userLevel || 0) < 3) {
    res.status(403).json({ error: 'Compliance features require Admin level 3 or higher' });
    return;
  }

  next();
}

export function setRequestMetadata(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  (global as any).requestIp = req.ip || req.socket.remoteAddress || 'unknown';
  (global as any).userAgent = req.headers['user-agent'] || 'unknown';
  next();
}