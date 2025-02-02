import express from 'express';
import { appointmentController } from '../controllers/appointmentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes (require authentication)
router.use(authMiddleware);

// Create a new appointment
router.post('/', appointmentController.createAppointment);

// Check for appointment conflicts
router.post('/check-conflicts', appointmentController.checkConflicts);

// Get doctor availability
router.get('/doctors/availability', appointmentController.getDoctorAvailability);

// Get available doctors for a treatment
router.get('/doctors/available', appointmentController.getAvailableDoctors);

// Get available rooms for a treatment
router.get('/rooms/available', appointmentController.getAvailableRooms);

export default router;
