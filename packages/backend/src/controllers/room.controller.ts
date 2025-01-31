import { Request, Response } from 'express';
import { RoomService } from '../services/room.service';
import { logger } from '../config/logger';

export class RoomController {
  static async getAllRooms(req: Request, res: Response) {
    try {
      const rooms = await RoomService.getAllRooms();
      return res.status(200).json({
        status: 'success',
        data: { rooms }
      });
    } catch (error) {
      logger.error('Get all rooms error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get rooms'
      });
    }
  }

  static async getRoomById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const room = await RoomService.getRoomById(id);
      
      if (!room) {
        return res.status(404).json({
          status: 'error',
          message: 'Room not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { room }
      });
    } catch (error) {
      logger.error('Get room by id error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get room'
      });
    }
  }

  static async createRoom(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to create rooms'
        });
      }

      const room = await RoomService.createRoom(req.body);
      return res.status(201).json({
        status: 'success',
        data: { room }
      });
    } catch (error) {
      logger.error('Create room error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to create room'
      });
    }
  }

  static async updateRoom(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update rooms'
        });
      }

      const { id } = req.params;
      const room = await RoomService.updateRoom(id, req.body);
      
      if (!room) {
        return res.status(404).json({
          status: 'error',
          message: 'Room not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { room }
      });
    } catch (error) {
      logger.error('Update room error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update room'
      });
    }
  }

  static async deleteRoom(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to delete rooms'
        });
      }

      const { id } = req.params;
      const success = await RoomService.deleteRoom(id);
      
      if (!success) {
        return res.status(404).json({
          status: 'error',
          message: 'Room not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Room deleted successfully'
      });
    } catch (error) {
      logger.error('Delete room error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete room'
      });
    }
  }
}
