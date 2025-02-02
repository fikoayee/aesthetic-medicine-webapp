import express from 'express';
import { specializationController } from '../controllers/specializationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes (require authentication)
router.use(authMiddleware);

// Get all specializations
router.get('/', specializationController.getAllSpecializations);

// Get doctor specializations
router.get('/doctors/:doctorId', specializationController.getDoctorSpecializations);

// Get room specializations
router.get('/rooms/:roomId', specializationController.getRoomSpecializations);

export default router;
