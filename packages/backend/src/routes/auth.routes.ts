import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Public routes
router.post('/login', AuthController.login);
router.post('/register', authenticate, authorize(UserRole.ADMIN), AuthController.register);

// Protected routes
router.post('/change-password', authenticate, AuthController.changePassword);

export default router;
