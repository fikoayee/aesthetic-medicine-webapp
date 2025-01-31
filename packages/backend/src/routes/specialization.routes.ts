import express from 'express';
import { SpecializationController } from '../controllers/specialization.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Routes accessible by all authenticated users
router.get('/', SpecializationController.getAllSpecializations);
router.get('/:id', SpecializationController.getSpecializationById);

// Routes that require ADMIN role
router.post('/', authorize(UserRole.ADMIN), SpecializationController.createSpecialization);
router.put('/:id', authorize(UserRole.ADMIN), SpecializationController.updateSpecialization);
router.delete('/:id', authorize(UserRole.ADMIN), SpecializationController.deleteSpecialization);

export default router;
