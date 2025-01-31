import { Request, Response } from 'express';
import { DoctorService } from '../services/doctor.service';
import { logger } from '../config/logger';

export class DoctorController {
  static async getAllDoctors(req: Request, res: Response) {
    try {
      const doctors = await DoctorService.getAllDoctors();
      return res.status(200).json({
        status: 'success',
        data: { doctors }
      });
    } catch (error) {
      logger.error('Get all doctors error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get doctors'
      });
    }
  }

  static async getDoctorById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doctor = await DoctorService.getDoctorById(id);
      
      if (!doctor) {
        return res.status(404).json({
          status: 'error',
          message: 'Doctor not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { doctor }
      });
    } catch (error) {
      logger.error('Get doctor by id error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get doctor'
      });
    }
  }

  static async createDoctor(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to create doctors'
        });
      }

      const doctor = await DoctorService.createDoctor(req.body);
      return res.status(201).json({
        status: 'success',
        data: { doctor }
      });
    } catch (error) {
      logger.error('Create doctor error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to create doctor'
      });
    }
  }

  static async updateDoctor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Allow if user is ADMIN or if doctor is updating their own profile
      if (req.user?.role !== 'ADMIN' && req.user?.id !== id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update this doctor'
        });
      }

      const doctor = await DoctorService.updateDoctor(id, req.body);
      
      if (!doctor) {
        return res.status(404).json({
          status: 'error',
          message: 'Doctor not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { doctor }
      });
    } catch (error) {
      logger.error('Update doctor error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update doctor'
      });
    }
  }

  static async deleteDoctor(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to delete doctors'
        });
      }

      const { id } = req.params;
      const success = await DoctorService.deleteDoctor(id);
      
      if (!success) {
        return res.status(404).json({
          status: 'error',
          message: 'Doctor not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Doctor deleted successfully'
      });
    } catch (error) {
      logger.error('Delete doctor error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete doctor'
      });
    }
  }
}
