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

export default router;
