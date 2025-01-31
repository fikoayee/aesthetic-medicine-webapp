import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { logger } from '../config/logger';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Username and password are required'
        });
      }

      const result = await AuthService.login(username, password);

      return res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error('Login controller error:', error);
      return res.status(401).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Authentication failed'
      });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const userData = await AuthService.register(req.body);

      return res.status(201).json({
        status: 'success',
        data: {
          user: userData
        }
      });
    } catch (error) {
      logger.error('Registration controller error:', error);
      return res.status(400).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Current password and new password are required'
        });
      }

      await AuthService.changePassword(userId, currentPassword, newPassword);

      return res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Change password controller error:', error);
      return res.status(400).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Password change failed'
      });
    }
  }
}
