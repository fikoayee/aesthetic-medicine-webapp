import express from 'express';
import { PatientController } from '../controllers/patient.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Routes accessible by all authenticated users
router.get('/', PatientController.getAllPatients);
router.get('/:id', PatientController.getPatientById);

// Routes that require RECEPTIONIST or ADMIN role
router.post('/', authorize(UserRole.ADMIN, UserRole.RECEPTIONIST), PatientController.createPatient);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.RECEPTIONIST), PatientController.updatePatient);

// Routes that require ADMIN role
router.delete('/:id', authorize(UserRole.ADMIN), PatientController.deletePatient);

export default router;
