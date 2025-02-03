import express from 'express';
import { SpecializationController } from '../controllers/specialization.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Routes accessible by all authenticated users
router.get('/', authenticate, SpecializationController.getAllSpecializations);
router.get('/:id', authenticate, SpecializationController.getSpecializationById);

// Routes that require ADMIN role
router.post('/', authenticate, SpecializationController.createSpecialization);
router.put('/:id', authenticate, SpecializationController.updateSpecialization);
router.delete('/:id', authenticate, SpecializationController.deleteSpecialization);
router.post('/transfer-treatments', authenticate, SpecializationController.transferTreatments);

export default router;
