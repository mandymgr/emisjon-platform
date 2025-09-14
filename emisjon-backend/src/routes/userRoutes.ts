import { Router } from 'express';
import { body, param } from 'express-validator';
import * as userController from '../controllers/userController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router: Router = Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().isMobilePhone('any'),
  ],
  userController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  userController.login
);

router.get(
  '/profile',
  authenticate,
  userController.getProfile
);

router.get(
  '/',
  authenticate,
  requireAdmin,
  userController.getAllUsers
);

router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().isMobilePhone('any'),
    body('role').optional().isIn(['USER', 'ADMIN']),
    body('level').optional().isInt({ min: 1, max: 3 }),
  ],
  userController.createUserByAdmin
);

router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('phone').optional().isMobilePhone('any'),
  ],
  userController.updateUser
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [
    param('id').notEmpty(),
    body('name').optional().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('phone').optional().isMobilePhone('any'),
    body('role').optional().isIn(['USER', 'ADMIN']),
    body('level').optional().isInt({ min: 1, max: 3 }),
  ],
  userController.updateUser
);

router.delete(
  '/:id',
  authenticate,
  [
    param('id').notEmpty(),
  ],
  userController.deleteUser
);


export default router;