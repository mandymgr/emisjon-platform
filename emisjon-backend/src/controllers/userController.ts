import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as userService from '../services/userService';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const result = await userService.createUser(req.body);
    
    // Set first-party cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.setHeader(
      'Set-Cookie',
      `session=${result.token}; Path=/; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Lax; Max-Age=604800`
    );
    
    // Still return token in response for backward compatibility
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const result = await userService.loginUser(req.body);
    
    // Set first-party cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.setHeader(
      'Set-Cookie',
      `session=${result.token}; Path=/; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Lax; Max-Age=604800`
    );
    
    // Still return token in response for backward compatibility
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId;
    const user = await userService.getUserById(userId);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.params.id || (req as any).userId;
    const requesterId = (req as any).userId;
    const requesterRole = (req as any).userRole;
    const requesterLevel = (req as any).userLevel;
    
    // Only admin level 2 can update other users
    if (req.params.id && (requesterRole !== 'ADMIN' || requesterLevel !== 2)) {
      res.status(403).json({ error: 'Access denied. Admin level 2 required to update other users.' });
      return;
    }
    
    // Users can update their own profile
    if (!req.params.id && userId !== requesterId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const result = await userService.updateUser(userId, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.id;
    const requesterId = (req as any).userId;
    const requesterRole = (req as any).userRole;
    const requesterLevel = (req as any).userLevel;
    
    // Only admin level 2 can delete users
    if (requesterRole !== 'ADMIN' || requesterLevel !== 2) {
      res.status(403).json({ error: 'Access denied. Admin level 2 required to delete users.' });
      return;
    }
    
    // Prevent admin from deleting themselves
    if (userId === requesterId) {
      res.status(400).json({ error: 'Cannot delete your own account.' });
      return;
    }

    await userService.deleteUser(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requesterRole = (req as any).userRole;
    const requesterLevel = (req as any).userLevel;
    
    // Only admin level 2 can view all users
    if (requesterRole !== 'ADMIN' || requesterLevel !== 2) {
      res.status(403).json({ error: 'Access denied. Admin level 2 required.' });
      return;
    }

    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

export async function createUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const requesterRole = (req as any).userRole;
    const requesterLevel = (req as any).userLevel;
    
    // Only admin level 2 can create users
    if (requesterRole !== 'ADMIN' || requesterLevel !== 2) {
      res.status(403).json({ error: 'Access denied. Admin level 2 required.' });
      return;
    }

    const result = await userService.createUser(req.body);
    res.status(201).json(result.user);
  } catch (error: any) {
    if (error.message === 'User already exists') {
      res.status(400).json({ error: error.message });
    } else {
      next(error);
    }
  }
}

