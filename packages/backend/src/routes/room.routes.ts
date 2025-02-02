import express from 'express';
import { RoomController } from '../controllers/room.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /rooms
router.get('/', RoomController.getAllRooms);

// GET /rooms/by-treatment
router.get('/by-treatment', RoomController.getAvailableRoomsForTreatment);

// GET /rooms/:id
router.get('/:id', RoomController.getRoomById);

// POST /rooms
router.post('/', RoomController.createRoom);

// PUT /rooms/:id
router.put('/:id', RoomController.updateRoom);

// DELETE /rooms/:id
router.delete('/:id', RoomController.deleteRoom);

export default router;
