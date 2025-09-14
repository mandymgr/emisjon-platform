import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as shareholderService from '../services/shareholderService';

// Get all shareholders
// Access: USER with level 2+ can view, ADMIN can view all
export async function getAllShareholders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userRole = (req as any).userRole;
    const userLevel = (req as any).userLevel;

    // Check access: Users need level 2+ or be an admin
    if (userRole === 'USER' && userLevel < 2) {
      res.status(403).json({ 
        error: 'Access denied. You need level 2 or higher to view shareholders.' 
      });
      return;
    }

    const shareholders = await shareholderService.getAllShareholders();
    res.status(200).json(shareholders);
  } catch (error) {
    next(error);
  }
}

// Get shareholder by ID
// Access: USER with level 2+ can view, ADMIN can view all
export async function getShareholderById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userRole = (req as any).userRole;
    const userLevel = (req as any).userLevel;

    // Check access: Users need level 2+ or be an admin
    if (userRole === 'USER' && userLevel < 2) {
      res.status(403).json({ 
        error: 'Access denied. You need level 2 or higher to view shareholder details.' 
      });
      return;
    }

    const { id } = req.params;
    const shareholder = await shareholderService.getShareholderById(id);
    res.status(200).json(shareholder);
  } catch (error) {
    next(error);
  }
}

// Create a new shareholder
// Access: Only ADMIN with level 1+
export async function createShareholder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userRole = (req as any).userRole;

    // Check if user is admin
    if (userRole !== 'ADMIN') {
      res.status(403).json({ 
        error: 'Access denied. Only administrators can create shareholders.' 
      });
      return;
    }

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const shareholder = await shareholderService.createShareholder(req.body);
    res.status(201).json(shareholder);
  } catch (error) {
    next(error);
  }
}

// Update a shareholder
// Access: Only ADMIN with level 1+
export async function updateShareholder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userRole = (req as any).userRole;

    // Check if user is admin
    if (userRole !== 'ADMIN') {
      res.status(403).json({ 
        error: 'Access denied. Only administrators can update shareholders.' 
      });
      return;
    }

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const shareholder = await shareholderService.updateShareholder(id, req.body);
    res.status(200).json(shareholder);
  } catch (error) {
    next(error);
  }
}

// Delete a shareholder
// Access: Only ADMIN with level 1+
export async function deleteShareholder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userRole = (req as any).userRole;

    // Check if user is admin
    if (userRole !== 'ADMIN') {
      res.status(403).json({ 
        error: 'Access denied. Only administrators can delete shareholders.' 
      });
      return;
    }

    const { id } = req.params;
    const result = await shareholderService.deleteShareholder(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// Get shareholder statistics
// Access: USER with level 2+ can view, ADMIN can view all
export async function getShareholderStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userRole = (req as any).userRole;
    const userLevel = (req as any).userLevel;

    // Check access: Users need level 2+ or be an admin
    if (userRole === 'USER' && userLevel < 2) {
      res.status(403).json({ 
        error: 'Access denied. You need level 2 or higher to view shareholder statistics.' 
      });
      return;
    }

    const stats = await shareholderService.getShareholderStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}