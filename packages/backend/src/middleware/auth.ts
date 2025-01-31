import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole, IUser } from '../models/User';
import { logger } from '../config/logger';

interface JwtPayload {
  userId: string;
  role: UserRole;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      token?: string;
    }
  }
}

export const generateToken = (user: IUser): string => {
  const payload: JwtPayload = {
    userId: user.id,
    role: user.role
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your_jwt_secret_here',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null;

    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret_here'
    ) as JwtPayload;

    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid token. User not found.' 
      });
    }

    // Attach user and token to request object
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ 
      status: 'error',
      message: 'Invalid token.' 
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'error',
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};
