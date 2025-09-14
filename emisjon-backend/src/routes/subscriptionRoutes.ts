import { Router } from 'express';
import * as subscriptionController from '../controllers/subscriptionController';
import { authenticate } from '../middleware/authMiddleware';

const router: Router = Router();

// All subscription routes require authentication
router.use(authenticate);

// User routes
router.post('/', subscriptionController.createSubscription);
router.get('/my-subscriptions', subscriptionController.getUserSubscriptions);
router.put('/:id', subscriptionController.updateSubscription);
router.delete('/:id', subscriptionController.deleteSubscription);

// Admin routes
router.get('/', subscriptionController.getAllSubscriptions);
router.get('/emission/:emissionId', subscriptionController.getEmissionSubscriptions);
router.get('/user/:userId', subscriptionController.getUserSubscriptions);
router.post('/:id/approve', subscriptionController.approveSubscription);
router.post('/:id/reject', subscriptionController.rejectSubscription);

export default router;