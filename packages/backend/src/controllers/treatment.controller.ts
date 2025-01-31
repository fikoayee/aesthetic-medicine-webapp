import { Request, Response } from 'express';
import { TreatmentService } from '../services/treatment.service';
import { logger } from '../config/logger';

export class TreatmentController {
  static async getAllTreatments(req: Request, res: Response) {
    try {
      const treatments = await TreatmentService.getAllTreatments();
      return res.status(200).json({
        status: 'success',
        data: { treatments }
      });
    } catch (error) {
      logger.error('Get all treatments error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get treatments'
      });
    }
  }

  static async getTreatmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const treatment = await TreatmentService.getTreatmentById(id);
      
      if (!treatment) {
        return res.status(404).json({
          status: 'error',
          message: 'Treatment not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { treatment }
      });
    } catch (error) {
      logger.error('Get treatment by id error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get treatment'
      });
    }
  }

  static async createTreatment(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to create treatments'
        });
      }

      const treatment = await TreatmentService.createTreatment(req.body);
      return res.status(201).json({
        status: 'success',
        data: { treatment }
      });
    } catch (error) {
      logger.error('Create treatment error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to create treatment'
      });
    }
  }

  static async updateTreatment(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update treatments'
        });
      }

      const { id } = req.params;
      const treatment = await TreatmentService.updateTreatment(id, req.body);
      
      if (!treatment) {
        return res.status(404).json({
          status: 'error',
          message: 'Treatment not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { treatment }
      });
    } catch (error) {
      logger.error('Update treatment error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update treatment'
      });
    }
  }

  static async deleteTreatment(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to delete treatments'
        });
      }

      const { id } = req.params;
      const success = await TreatmentService.deleteTreatment(id);
      
      if (!success) {
        return res.status(404).json({
          status: 'error',
          message: 'Treatment not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Treatment deleted successfully'
      });
    } catch (error) {
      logger.error('Delete treatment error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete treatment'
      });
    }
  }
}
