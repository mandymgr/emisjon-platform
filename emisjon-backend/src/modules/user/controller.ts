import { Request, Response, NextFunction } from 'express';
import { UserService } from './service';
import { validationResult } from 'express-validator';

interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  userLevel?: number;
}

const userService = new UserService();

export class UserController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const result = await userService.createUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const result = await userService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
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

  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Only admin level 2 can view all users
      if (req.userRole !== 'ADMIN' || req.userLevel !== 2) {
        res.status(403).json({ error: 'Access denied. Admin level 2 required.' });
        return;
      }

      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Only admin level 2 can update users
      if (req.userRole !== 'ADMIN' || req.userLevel !== 2) {
        res.status(403).json({ error: 'Access denied. Admin level 2 required.' });
        return;
      }

      const { id } = req.params;
      const updatedUser = await userService.updateUser(id, req.body);
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Only admin level 2 can delete users
      if (req.userRole !== 'ADMIN' || req.userLevel !== 2) {
        res.status(403).json({ error: 'Access denied. Admin level 2 required.' });
        return;
      }

      const { id } = req.params;
      
      // Prevent admin from deleting themselves
      if (id === req.userId) {
        res.status(400).json({ error: 'Cannot delete your own account.' });
        return;
      }

      await userService.deleteUser(id);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}