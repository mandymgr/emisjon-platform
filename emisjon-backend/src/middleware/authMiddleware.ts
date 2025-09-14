import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: 'USER' | 'ADMIN';
  userLevel?: number;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Try to get token from cookie first, then fall back to Authorization header
    let token = (req as any).cookies?.session;
    
    // Also check for cookie in different formats (for compatibility)
    if (!token && (req as any).cookies) {
      token = (req as any).cookies['session'];
    }
    
    if (!token) {
      token = req.headers.authorization?.replace('Bearer ', '');
    }
    
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        level: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.userId = user.id;
    req.userRole = user.role;
    req.userLevel = user.level;
    (req as any).userLevel = user.level;
    (req as any).userRole = user.role;
    (req as any).user = user;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.userRole !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

export function requireLevel(minLevel: number) {
  return function(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void {
    if ((req.userLevel || 0) < minLevel) {
      res.status(403).json({ error: `Access level ${minLevel} or higher required` });
      return;
    }
    next();
  };
}

