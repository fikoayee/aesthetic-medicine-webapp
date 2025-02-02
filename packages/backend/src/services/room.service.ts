import { Room, IRoom } from '../models/Room';
import { logger } from '../config/logger';

export class RoomService {
  static async getAllRooms(): Promise<IRoom[]> {
    try {
      return await Room.find().populate('specializations');
    } catch (error) {
      logger.error('Get all rooms service error:', error);
      throw error;
    }
  }

  static async getRoomById(id: string): Promise<IRoom | null> {
    try {
      return await Room.findById(id).populate('specializations');
    } catch (error) {
      logger.error('Get room by id service error:', error);
      throw error;
    }
  }

  static async getRoomsByTreatment(treatmentId: string): Promise<IRoom[]> {
    try {
      // First get the treatment to find its specialization
      const treatment = await import('../models/Treatment').then(m => m.Treatment.findById(treatmentId));
      if (!treatment) {
        throw new Error('Treatment not found');
      }

      // Then find rooms that have this specialization
      return await Room.find({
        specializations: treatment.specialization
      }).populate('specializations');
    } catch (error) {
      logger.error('Get rooms by treatment service error:', error);
      throw error;
    }
  }

  static async createRoom(roomData: Partial<IRoom>): Promise<IRoom> {
    try {
      const room = new Room(roomData);
      await room.save();
      return room;
    } catch (error) {
      logger.error('Create room service error:', error);
      throw error;
    }
  }

  static async updateRoom(id: string, updateData: Partial<IRoom>): Promise<IRoom | null> {
    try {
      const room = await Room.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      return room;
    } catch (error) {
      logger.error('Update room service error:', error);
      throw error;
    }
  }

  static async deleteRoom(id: string): Promise<boolean> {
    try {
      const result = await Room.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      logger.error('Delete room service error:', error);
      throw error;
    }
  }
}
