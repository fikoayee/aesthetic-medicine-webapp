import express from 'express';
import { DoctorController } from '../controllers/doctor.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// More specific routes first
router.get('/by-treatment', DoctorController.getAvailableDoctorsForTreatment);
router.get('/get-availability', DoctorController.getDoctorAvailability);

// Generic CRUD routes
router.get('/', DoctorController.getAllDoctors);
router.get('/:id', DoctorController.getDoctorById);
router.post('/', DoctorController.createDoctor);
router.put('/:id', DoctorController.updateDoctor);
router.delete('/:id', DoctorController.deleteDoctor);

export default router;
