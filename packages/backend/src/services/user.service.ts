import { User, IUser } from '../models/User';
import { logger } from '../config/logger';

export class UserService {
  static async getAllUsers(): Promise<IUser[]> {
    try {
      return await User.find().select('-password');
    } catch (error) {
      logger.error('Get all users service error:', error);
      throw error;
    }
  }

  static async getUserById(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id).select('-password');
    } catch (error) {
      logger.error('Get user by id service error:', error);
      throw error;
    }
  }

  static async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    try {
      // Remove sensitive fields that shouldn't be updated directly
      const { password, role, ...safeUpdateData } = updateData;
      
      const user = await User.findByIdAndUpdate(
        id,
        { $set: safeUpdateData },
        { new: true, runValidators: true }
      ).select('-password');

      return user;
    } catch (error) {
      logger.error('Update user service error:', error);
      throw error;
    }
  }

  static async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      logger.error('Delete user service error:', error);
      throw error;
    }
  }

  static async getUserProfile(id: string): Promise<IUser | null> {
    try {
      const user = await User.findById(id)
        .select('-password')
        .populate({
          path: 'doctorId',
          populate: {
            path: 'specializations',
            model: 'Specialization'
          }
        });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      logger.error('Get user profile service error:', error);
      throw error;
    }
  }
}
