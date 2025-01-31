import mongoose from 'mongoose';
import { logger } from './logger';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aesthetic-clinic';
    await mongoose.connect(mongoURI);
    logger.info('MongoDB Connected Successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
