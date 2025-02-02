import { Request, Response } from 'express';
import { Room } from '../models/Room';
import { Specialization } from '../models/Specialization';
import { Treatment } from '../models/Treatment';
import { logger } from '../config/logger';
import { RoomService } from '../services/room.service';

export class RoomController {
  static async getAllRooms(req: Request, res: Response) {
    try {
      const rooms = await Room.find().populate({
        path: 'specializations',
        model: Specialization,
        populate: {
          path: 'treatments',
          model: Treatment,
          select: 'name description duration price'
        }
      });
      
      return res.status(200).json({
        status: 'success',
        data: { rooms }
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get rooms'
      });
    }
  }

  static async getRoomById(req: Request, res: Response) {
    try {
      const room = await Room.findById(req.params.id).populate({
        path: 'specializations',
        model: Specialization,
        populate: {
          path: 'treatments',
          model: Treatment,
          select: 'name description duration price'
        }
      });
      
      if (!room) {
        return res.status(404).json({
          status: 'error',
          message: 'Room not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          room
        }
      });
    } catch (error) {
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

      const room = await Room.create(req.body);
      const populatedRoom = await room.populate({
        path: 'specializations',
        model: Specialization,
        populate: {
          path: 'treatments',
          model: Treatment,
          select: 'name description duration price'
        }
      });

      return res.status(201).json({
        status: 'success',
        data: {
          room: populatedRoom
        }
      });
    } catch (error) {
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

      const room = await Room.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate({
        path: 'specializations',
        model: Specialization,
        populate: {
          path: 'treatments',
          model: Treatment,
          select: 'name description duration price'
        }
      });

      if (!room) {
        return res.status(404).json({
          status: 'error',
          message: 'Room not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          room
        }
      });
    } catch (error) {
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

      const room = await Room.findByIdAndDelete(req.params.id);
      
      if (!room) {
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
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete room'
      });
    }
  }

  static async getAvailableRoomsForTreatment(req: Request, res: Response) {
    try {
      const { treatmentId } = req.query;
      
      if (!treatmentId || typeof treatmentId !== 'string') {
        return res.status(400).json({
          status: 'error',
          message: 'Treatment ID is required'
        });
      }

      const rooms = await RoomService.getRoomsByTreatment(treatmentId);
      return res.status(200).json({
        status: 'success',
        data: { rooms }
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get available rooms'
      });
    }
  }
}
