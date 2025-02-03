import express from 'express';
import { RoomController } from '../controllers/room.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Routes accessible by all authenticated users
router.get('/', RoomController.getAllRooms);
router.get('/:id', RoomController.getRoomById);
router.get('/:roomId/specializations', RoomController.getRoomSpecializations);

// Routes that require ADMIN role
router.post('/', RoomController.createRoom);
router.put('/:id', RoomController.updateRoom);
router.delete('/:id', RoomController.deleteRoom);

export default router;
