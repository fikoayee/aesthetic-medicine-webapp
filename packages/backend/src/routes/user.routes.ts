import express from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Routes that require ADMIN role
router.get('/', authorize(UserRole.ADMIN), UserController.getAllUsers);
router.delete('/:id', authorize(UserRole.ADMIN), UserController.deleteUser);

// Routes that require authentication but can be accessed by the user themselves or ADMIN
router.get('/:id/profile', UserController.getUserProfile);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);

export default router;
