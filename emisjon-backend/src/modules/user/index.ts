import { Router } from 'express';
import { UserController } from './controller';
import { body } from 'express-validator';
import { authMiddleware } from '../../middleware/auth';

const router: Router = Router();
const userController = new UserController();

const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').isString().trim().notEmpty(),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post('/register', registerValidation, userController.register);
router.post('/login', loginValidation, userController.login);
router.get('/profile', authMiddleware, userController.getProfile);
router.get('/', authMiddleware, userController.getAllUsers);

export default router;