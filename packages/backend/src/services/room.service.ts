import { Room, IRoom } from '../models/Room';
import { logger } from '../config/logger';

export class RoomService {
  static async getAllRooms(): Promise<IRoom[]> {
    try {
      return await Room.find();
    } catch (error) {
      logger.error('Get all rooms service error:', error);
      throw error;
    }
  }

  static async getRoomById(id: string): Promise<IRoom | null> {
    try {
      return await Room.findById(id);
    } catch (error) {
      logger.error('Get room by id service error:', error);
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
      return result !== null;
    } catch (error) {
      logger.error('Delete room service error:', error);
      throw error;
    }
  }
}
