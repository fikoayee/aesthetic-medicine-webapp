import { Request, Response } from 'express';
import { PatientService } from '../services/patient.service';
import { logger } from '../config/logger';

export class PatientController {
  static async getAllPatients(req: Request, res: Response) {
    try {
      const patients = await PatientService.getAllPatients();
      return res.status(200).json({
        status: 'success',
        data: { patients }
      });
    } catch (error) {
      logger.error('Get all patients error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get patients'
      });
    }
  }

  static async searchPatients(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          status: 'error',
          message: 'Search query is required'
        });
      }

      const patients = await PatientService.searchPatients(query);
      return res.status(200).json({
        status: 'success',
        data: { patients }
      });
    } catch (error) {
      logger.error('Search patients error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to search patients'
      });
    }
  }

  static async getPatientById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const patient = await PatientService.getPatientById(id);
      
      if (!patient) {
        return res.status(404).json({
          status: 'error',
          message: 'Patient not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { patient }
      });
    } catch (error) {
      logger.error('Get patient by id error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get patient'
      });
    }
  }

  static async createPatient(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN' && req.user?.role !== 'RECEPTIONIST') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to create patients'
        });
      }

      const patient = await PatientService.createPatient(req.body);
      return res.status(201).json({
        status: 'success',
        data: { patient }
      });
    } catch (error) {
      logger.error('Create patient error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to create patient'
      });
    }
  }

  static async updatePatient(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN' && req.user?.role !== 'RECEPTIONIST') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update patients'
        });
      }

      const { id } = req.params;
      const patient = await PatientService.updatePatient(id, req.body);
      
      if (!patient) {
        return res.status(404).json({
          status: 'error',
          message: 'Patient not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { patient }
      });
    } catch (error) {
      logger.error('Update patient error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update patient'
      });
    }
  }

  static async deletePatient(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to delete patients'
        });
      }

      const { id } = req.params;
      const success = await PatientService.deletePatient(id);
      
      if (!success) {
        return res.status(404).json({
          status: 'error',
          message: 'Patient not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Patient deleted successfully'
      });
    } catch (error) {
      logger.error('Delete patient error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete patient'
      });
    }
  }
}
