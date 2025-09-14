import { Router } from 'express';
import { body, param } from 'express-validator';
import * as shareholderController from '../controllers/shareholderController';
import { authenticate } from '../middleware/authMiddleware';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

// Get all shareholders
// Access: Users with level 2+ and all admins
router.get(
  '/',
  shareholderController.getAllShareholders
);

// Get shareholder statistics
// Access: Users with level 2+ and all admins
router.get(
  '/stats',
  shareholderController.getShareholderStats
);

// Get shareholder by ID
// Access: Users with level 2+ and all admins
router.get(
  '/:id',
  [
    param('id').notEmpty().withMessage('Shareholder ID is required')
  ],
  shareholderController.getShareholderById
);

// Create a new shareholder
// Access: Only admins
router.post(
  '/',
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().withMessage('Phone must be a valid string'),
    body('sharesOwned').isInt({ min: 0 }).withMessage('Shares owned must be a positive integer'),
    body('userId').optional().isString().withMessage('User ID must be a valid string')
  ],
  shareholderController.createShareholder
);

// Update a shareholder
// Access: Only admins
router.put(
  '/:id',
  [
    param('id').notEmpty().withMessage('Shareholder ID is required'),
    body('name').optional().notEmpty().trim().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().withMessage('Phone must be a valid string'),
    body('sharesOwned').optional().isInt({ min: 0 }).withMessage('Shares owned must be a positive integer'),
    body('userId').optional().isString().withMessage('User ID must be a valid string or null')
  ],
  shareholderController.updateShareholder
);

// Delete a shareholder
// Access: Only admins
router.delete(
  '/:id',
  [
    param('id').notEmpty().withMessage('Shareholder ID is required')
  ],
  shareholderController.deleteShareholder
);

export default router;