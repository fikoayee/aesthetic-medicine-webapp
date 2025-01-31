import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

router.post('/login', AuthController.login);

// Protected routes
router.post('/register', authenticate, authorize(UserRole.ADMIN), AuthController.register);
router.post('/change-password', authenticate, AuthController.changePassword);

export default router;
