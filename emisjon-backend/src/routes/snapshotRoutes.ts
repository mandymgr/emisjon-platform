import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import * as snapshotController from '../controllers/snapshotController';

const router: Router = Router();

// All snapshot routes require authentication
router.use(authenticate);

// Get all snapshots (admin only)
router.get('/', snapshotController.getAllSnapshots);

// Compare two snapshots (must be before :id route)
router.get('/compare', snapshotController.compareSnapshots);

// Get specific snapshot
router.get('/:id', snapshotController.getSnapshotById);

export default router;