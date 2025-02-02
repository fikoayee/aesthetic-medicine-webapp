import { Request, Response } from 'express';
import { DoctorService } from '../services/doctor.service';
import { logger } from '../config/logger';

export class DoctorController {
  static async getAllDoctors(req: Request, res: Response) {
    try {
      const doctors = await DoctorService.getAllDoctors({ populate: { path: 'specializations' } });
      return res.status(200).json({
        status: 'success',
        data: doctors
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get doctors'
      });
    }
  }

  static async getDoctorAvailability(req: Request, res: Response) {
    try {
      const { date } = req.query;
      logger.info('Getting availability for date:', date);
      
      if (!date || typeof date !== 'string') {
        return res.status(400).json({
          status: 'error',
          message: 'Date is required'
        });
      }

      const doctors = await DoctorService.getAllDoctors();
      logger.info('Found doctors:', doctors.length);

      const availability = await Promise.all(
        doctors.map(async (doctor) => {
          const slots = await DoctorService.getDoctorAvailability(doctor._id.toString(), date);
          logger.info(`Doctor ${doctor._id} availability:`, slots);
          return {
            doctorId: doctor._id,
            availableSlots: slots
          };
        })
      );

      logger.info('Final availability:', availability);
      return res.status(200).json({
        status: 'success',
        data: { availability }
      });
    } catch (error) {
      logger.error('Error getting doctor availability:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get doctor availability'
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
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete doctor'
      });
    }
  }

  static async getAvailableDoctorsForTreatment(req: Request, res: Response) {
    try {
      const { treatmentId } = req.query;
      logger.info(`Getting available doctors for treatment: ${treatmentId}`);
      
      if (!treatmentId || typeof treatmentId !== 'string') {
        logger.error('Invalid or missing treatmentId:', treatmentId);
        return res.status(400).json({
          status: 'error',
          message: 'Treatment ID is required'
        });
      }

      const doctors = await DoctorService.getDoctorsByTreatment(treatmentId);
      logger.info(`Found ${doctors.length} doctors for treatment ${treatmentId}`);
      
      if (doctors.length === 0) {
        logger.info('No doctors found, checking treatment and specialization...');
        const { Treatment } = await import('../models/Treatment');
        const treatment = await Treatment.findById(treatmentId);
        logger.info(`Treatment details:`, {
          exists: !!treatment,
          name: treatment?.name,
          specializationId: treatment?.specialization
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { doctors }
      });
    } catch (error) {
      logger.error('Error getting available doctors:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get available doctors'
      });
    }
  }
}
