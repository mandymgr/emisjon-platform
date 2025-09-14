import { Router } from 'express';
import { body, param } from 'express-validator';
import * as emissionController from '../controllers/emissionController';
import { authenticate } from '../middleware/authMiddleware';
import { uploadEmissionPDF } from '../middleware/uploadMiddleware';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

// Get all emissions
// Access: Level 3+ users and all admins
router.get(
  '/',
  emissionController.getAllEmissions
);

// Get emission by ID
// Access: Level 3+ users and all admins
router.get(
  '/:id',
  [
    param('id').notEmpty().withMessage('Emission ID is required')
  ],
  emissionController.getEmissionById
);

// Create a new emission
// Access: Only admins
router.post(
  '/',
  uploadEmissionPDF, // Add multer middleware for file upload
  [
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('description').optional().trim(),
    body('sharesBefore')
      .notEmpty().withMessage('Shares before is required')
      .isNumeric().withMessage('Shares before must be a number')
      .custom((value) => parseInt(value) >= 0).withMessage('Shares before must be non-negative'),
    body('newSharesOffered')
      .notEmpty().withMessage('New shares offered is required')
      .isNumeric().withMessage('New shares offered must be a number')
      .custom((value) => parseInt(value) >= 1).withMessage('New shares offered must be at least 1'),
    body('pricePerShare')
      .notEmpty().withMessage('Price per share is required')
      .isNumeric().withMessage('Price per share must be a number')
      .custom((value) => parseFloat(value) > 0).withMessage('Price per share must be greater than 0'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('status').optional().isIn(['PREVIEW', 'ACTIVE', 'COMPLETED']).withMessage('Invalid status')
  ],
  emissionController.createEmission
);

// Update an emission
// Access: Only admins
router.put(
  '/:id',
  uploadEmissionPDF, // Add multer middleware for file upload
  [
    param('id').notEmpty().withMessage('Emission ID is required'),
    body('title').optional().notEmpty().trim().withMessage('Title cannot be empty'),
    body('description').optional().trim(),
    body('sharesBefore')
      .optional()
      .isNumeric().withMessage('Shares before must be a number')
      .custom((value) => !value || parseInt(value) >= 0).withMessage('Shares before must be non-negative'),
    body('newSharesOffered')
      .optional()
      .isNumeric().withMessage('New shares offered must be a number')
      .custom((value) => !value || parseInt(value) >= 1).withMessage('New shares offered must be at least 1'),
    body('pricePerShare')
      .optional()
      .isNumeric().withMessage('Price per share must be a number')
      .custom((value) => !value || parseFloat(value) > 0).withMessage('Price per share must be greater than 0'),
    body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
    body('status').optional().isIn(['PREVIEW', 'ACTIVE', 'COMPLETED']).withMessage('Invalid status')
  ],
  emissionController.updateEmission
);

// Delete an emission
// Access: Only admins (can only delete PREVIEW emissions)
router.delete(
  '/:id',
  [
    param('id').notEmpty().withMessage('Emission ID is required')
  ],
  emissionController.deleteEmission
);

// Activate an emission
// Access: Only admins
router.post(
  '/:id/activate',
  [
    param('id').notEmpty().withMessage('Emission ID is required')
  ],
  emissionController.activateEmission
);

// Complete an emission
// Access: Only admins
router.post(
  '/:id/complete',
  [
    param('id').notEmpty().withMessage('Emission ID is required')
  ],
  emissionController.completeEmission
);

// Set preview mode
// Access: Only admin level 2
router.post(
  '/:id/preview',
  [
    param('id').notEmpty().withMessage('Emission ID is required'),
    body('isPreview').isBoolean().withMessage('isPreview must be a boolean')
  ],
  emissionController.setPreviewMode
);

// Finalize an emission
// Access: Only admin level 2
router.post(
  '/:id/finalize',
  [
    param('id').notEmpty().withMessage('Emission ID is required')
  ],
  emissionController.finalizeEmission
);

// Get emission snapshots
// Access: Only admins
router.get(
  '/:id/snapshots',
  [
    param('id').notEmpty().withMessage('Emission ID is required')
  ],
  emissionController.getEmissionSnapshots
);

// Get emission audit logs
// Access: Only admins
router.get(
  '/:id/audit-logs',
  [
    param('id').notEmpty().withMessage('Emission ID is required')
  ],
  emissionController.getEmissionAuditLogs
);

export default router;