import { User, IUser, UserRole } from '../models/User';
import { generateToken } from '../middleware/auth';
import { logger } from '../config/logger';

interface UserResponse {
  id: string;
  username: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

interface LoginResponse {
  token: string;
  user: UserResponse;
}

interface RegisterResponse {
  id: string;
  username: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export class AuthService {
  static async login(username: string, password: string): Promise<LoginResponse> {
    try {
      // Find user by username
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error('Invalid username or password');
      }

      // Verify password using the model's method
      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        throw new Error('Invalid username or password');
      }

      // Generate JWT token
      const token = generateToken(user);

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };
    } catch (error) {
      logger.error('Login service error:', error);
      throw error;
    }
  }

  static async register(userData: Partial<IUser>): Promise<RegisterResponse> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { username: userData.username },
          { email: userData.email }
        ]
      });

      if (existingUser) {
        throw new Error('User with this username or email already exists');
      }

      // Create new user - password will be hashed by the pre-save hook
      const user = new User(userData);
      await user.save();

      return {
        id: user.id,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await user.verifyPassword(currentPassword);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return true;
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }
}
