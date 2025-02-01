import express from 'express';
import { TreatmentController } from '../controllers/treatment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Routes accessible by all authenticated users
router.get('/', authenticate,TreatmentController.getAllTreatments);
router.get('/:id', authenticate, TreatmentController.getTreatmentById);

// Routes that require ADMIN role
router.post('/', authorize(UserRole.ADMIN), TreatmentController.createTreatment);

router.put('/:id', authorize(UserRole.ADMIN), TreatmentController.updateTreatment);

router.delete('/:id', authorize(UserRole.ADMIN), TreatmentController.deleteTreatment);

export default router;
