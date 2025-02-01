import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { logger } from './config/logger';
import { errorHandler, ApiError, ValidationError } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import patientRoutes from './routes/patient.routes';
import treatmentRoutes from './routes/treatment.routes';
import roomRoutes from './routes/room.routes';
import doctorRoutes from './routes/doctor.routes';
import specializationRoutes from './routes/specialization.routes';
import appointmentRoutes from './routes/appointment.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(helmet());
app.use(express.json());

// Test routes for error handling
app.get('/test/error/api', (req, res, next) => {
  throw new ApiError(400, 'Test API error');
});

app.get('/test/error/validation', (req, res, next) => {
  throw new ValidationError('Test validation error', {
    email: 'Invalid email format',
    password: 'Password too short'
  });
});

app.get('/test/error/unhandled', (req, res, next) => {
  throw new Error('Test unhandled error');
});

app.get('/test/error/async', async (req, res, next) => {
  try {
    // Simulate async operation that fails
    await Promise.reject(new Error('Test async error'));
  } catch (error) {
    next(error);
  }
});

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/patients', patientRoutes);
app.use('/rooms', roomRoutes);
app.use('/doctors', doctorRoutes);
app.use('/specializations', specializationRoutes);
app.use('/treatments', treatmentRoutes);
app.use('/appointments', appointmentRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'aesthetic-clinic-api' });
});

// Global error handler - should be last
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
