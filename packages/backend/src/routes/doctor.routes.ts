import express from 'express';
import { DoctorController } from '../controllers/doctor.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Routes accessible by all authenticated users
router.get('/', DoctorController.getAllDoctors);
router.get('/:id', DoctorController.getDoctorById);

// Routes that require ADMIN role
router.post('/', authorize(UserRole.ADMIN), DoctorController.createDoctor);
router.delete('/:id', authorize(UserRole.ADMIN), DoctorController.deleteDoctor);

// Route accessible by ADMIN or the doctor themselves
router.put('/:id', authenticate, DoctorController.updateDoctor);

export default router;
