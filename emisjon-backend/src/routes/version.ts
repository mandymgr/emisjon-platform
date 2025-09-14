import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { version } from '../../package.json';

const router: RouterType = Router();

// Get version info
router.get('/version', (_, res) => {
  res.json({
    version,
    environment: process.env.NODE_ENV || 'development',
    deployedAt: new Date().toISOString(),
    gitCommit: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'local',
    gitBranch: process.env.VERCEL_GIT_COMMIT_REF || 'local'
  });
});

export default router;