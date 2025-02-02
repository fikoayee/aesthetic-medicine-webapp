import express from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get available slots (must be before /:id to prevent conflict)
router.get('/available-slots', AppointmentController.getAvailableSlots);

// Check for conflicts
router.post('/check-conflicts', AppointmentController.checkForConflicts);

// Basic appointment operations
router.get('/', AppointmentController.getAllAppointments);
router.get('/:id', AppointmentController.getAppointmentById);

// Operations restricted to ADMIN and RECEPTIONIST
router.post('/', authorize(UserRole.ADMIN, UserRole.RECEPTIONIST), AppointmentController.createAppointment);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.RECEPTIONIST), AppointmentController.updateAppointment);
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.RECEPTIONIST), AppointmentController.deleteAppointment);

export default router;