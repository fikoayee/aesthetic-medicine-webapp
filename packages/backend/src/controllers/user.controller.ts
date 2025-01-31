import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { logger } from '../config/logger';

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      return res.status(200).json({
        status: 'success',
        data: { users }
      });
    } catch (error) {
      logger.error('Get all users error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get users'
      });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      logger.error('Get user by id error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get user'
      });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (req.user?.role !== 'ADMIN' && req.user?.id !== id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update this user'
        });
      }

      const user = await UserService.updateUser(id, updateData);
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      logger.error('Update user error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update user'
      });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to delete users'
        });
      }

      const success = await UserService.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error('Delete user error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete user'
      });
    }
  }
}
