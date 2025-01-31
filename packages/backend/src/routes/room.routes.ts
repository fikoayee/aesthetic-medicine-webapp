import express from 'express';
import { RoomController } from '../controllers/room.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Routes accessible by all authenticated users
router.get('/', RoomController.getAllRooms);
router.get('/:id', RoomController.getRoomById);

// Routes that require ADMIN role
router.post('/', authorize(UserRole.ADMIN), RoomController.createRoom);
router.put('/:id', authorize(UserRole.ADMIN), RoomController.updateRoom);
router.delete('/:id', authorize(UserRole.ADMIN), RoomController.deleteRoom);

export default router;
