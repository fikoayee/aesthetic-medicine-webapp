import express from 'express';
import { getDashboardStatistics } from '../controllers/statisticsController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

console.log('Registering statistics routes...');

// Test endpoint
router.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ status: 'success', message: 'Statistics routes are working' });
});

// Get dashboard statistics
router.get('/dashboard', authenticate, (req, res, next) => {
  console.log('Dashboard endpoint hit');
  getDashboardStatistics(req, res).catch(next);
});

export default router;
