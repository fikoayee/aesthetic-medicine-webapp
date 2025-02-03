import express from 'express';
import { SpecializationController } from '../controllers/specialization.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all specializations (with treatments)
router.get('/', SpecializationController.getAllSpecializations);

// Get specialization by id (with treatments)
router.get('/:id', SpecializationController.getSpecializationById);

// Create new specialization (admin only)
router.post('/', SpecializationController.createSpecialization);

// Update specialization (admin only)
router.put('/:id', SpecializationController.updateSpecialization);

// Delete specialization (admin only)
router.delete('/:id', SpecializationController.deleteSpecialization);

export default router;
