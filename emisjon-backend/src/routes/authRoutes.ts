import { Router } from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const router: Router = Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
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

router.post('/logout', authenticate, (_req, res) => {
  // Clear the auth cookie with exact same attributes
  const isProduction = process.env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    `session=; Path=/; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Lax; Max-Age=0`
  );
  res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/me', authenticate, userController.getProfile);

router.get('/check', authenticate, (req: any, res) => {
  // Return user data without exposing the token
  res.status(200).json({ user: req.user });
});

export default router;