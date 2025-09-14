import { Request, Response } from 'express';
import * as subscriptionService from '../services/subscriptionService';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: 'USER' | 'ADMIN';
    level: number;
    name: string;
    email: string;
  };
}

// Create a new subscription (User level 3+)
export async function createSubscription(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const { emissionId, sharesRequested } = req.body;

    // Check user level
    if (authReq.user.role === 'USER' && authReq.user.level < 3) {
      res.status(403).json({ 
        error: 'You need Level 3 access to subscribe to emissions' 
      });
      return;
    }

    if (!emissionId || !sharesRequested) {
      res.status(400).json({ 
        error: 'Emission ID and shares requested are required' 
      });
      return;
    }

    if (sharesRequested <= 0) {
      res.status(400).json({ 
        error: 'Shares requested must be greater than 0' 
      });
      return;
    }

    const subscription = await subscriptionService.createSubscription(userId, {
      emissionId,
      sharesRequested
    });

    res.status(201).json(subscription);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// Get user's own subscriptions
export async function getUserSubscriptions(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = req.params.userId || authReq.user.id;

    // Users can only view their own subscriptions unless admin
    if (userId !== authReq.user.id && authReq.user.role !== 'ADMIN') {
      res.status(403).json({ 
        error: 'You can only view your own subscriptions' 
      });
      return;
    }

    const subscriptions = await subscriptionService.getUserSubscriptions(userId);
    res.json(subscriptions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Get all subscriptions for an emission (Admin only)
export async function getEmissionSubscriptions(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { emissionId } = req.params;

    if (authReq.user.role !== 'ADMIN') {
      res.status(403).json({ 
        error: 'Only admins can view emission subscriptions' 
      });
      return;
    }

    const subscriptions = await subscriptionService.getEmissionSubscriptions(emissionId);
    res.json(subscriptions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Get all subscriptions (Admin only)
export async function getAllSubscriptions(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user.role !== 'ADMIN') {
      res.status(403).json({ 
        error: 'Only admins can view all subscriptions' 
      });
      return;
    }

    const subscriptions = await subscriptionService.getAllSubscriptions();
    res.json(subscriptions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Approve subscription (Admin level 2 only)
export async function approveSubscription(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const { sharesAllocated } = req.body;

    if (authReq.user.role !== 'ADMIN' || authReq.user.level < 2) {
      res.status(403).json({ 
        error: 'Only Admin Level 2 can approve subscriptions' 
      });
      return;
    }

    if (!sharesAllocated || sharesAllocated <= 0) {
      res.status(400).json({ 
        error: 'Valid shares allocated amount is required' 
      });
      return;
    }

    const subscription = await subscriptionService.approveSubscription(
      id,
      authReq.user.id,
      sharesAllocated
    );

    res.json(subscription);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// Reject subscription (Admin level 2 only)
export async function rejectSubscription(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    if (authReq.user.role !== 'ADMIN' || authReq.user.level < 2) {
      res.status(403).json({ 
        error: 'Only Admin Level 2 can reject subscriptions' 
      });
      return;
    }

    const subscription = await subscriptionService.rejectSubscription(
      id,
      authReq.user.id
    );

    res.json(subscription);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// Update subscription (User can update their pending subscription)
export async function updateSubscription(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const { sharesRequested } = req.body;

    if (!sharesRequested || sharesRequested <= 0) {
      res.status(400).json({ 
        error: 'Valid shares requested amount is required' 
      });
      return;
    }

    const subscription = await subscriptionService.updateSubscription(
      id,
      authReq.user.id,
      sharesRequested
    );

    res.json(subscription);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// Delete subscription (User can delete their pending subscription)
export async function deleteSubscription(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    await subscriptionService.deleteSubscription(id, authReq.user.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}