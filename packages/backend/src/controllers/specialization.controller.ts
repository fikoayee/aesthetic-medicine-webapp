import { Request, Response } from 'express';
import { Specialization } from '../models/Specialization';
import { Treatment } from '../models/Treatment';
import { logger } from '../config/logger';

export class SpecializationController {
  static async getAllSpecializations(req: Request, res: Response) {
    try {
      const specializations = await Specialization.find().populate({
        path: 'treatments',
        model: Treatment,
        select: 'name description duration price'
      });
      
      return res.status(200).json({
        status: 'success',
        data: {
          specializations
        }
      });
    } catch (error) {
      logger.error('Get all specializations error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get specializations'
      });
    }
  }

  static async getSpecializationById(req: Request, res: Response) {
    try {
      const specialization = await Specialization.findById(req.params.id).populate({
        path: 'treatments',
        model: Treatment,
        select: 'name description duration price'
      });
      
      if (!specialization) {
        return res.status(404).json({
          status: 'error',
          message: 'Specialization not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          specialization
        }
      });
    } catch (error) {
      logger.error('Get specialization by id error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get specialization'
      });
    }
  }

  static async createSpecialization(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to create specializations'
        });
      }

      const specialization = await Specialization.create(req.body);
      return res.status(201).json({
        status: 'success',
        data: { specialization }
      });
    } catch (error) {
      logger.error('Create specialization error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to create specialization'
      });
    }
  }

  static async updateSpecialization(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update specializations'
        });
      }

      const { id } = req.params;
      const specialization = await Specialization.findByIdAndUpdate(id, req.body, { new: true });
      
      if (!specialization) {
        return res.status(404).json({
          status: 'error',
          message: 'Specialization not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { specialization }
      });
    } catch (error) {
      logger.error('Update specialization error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update specialization'
      });
    }
  }

  static async deleteSpecialization(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to delete specializations'
        });
      }

      const { id } = req.params;
      const success = await Specialization.findByIdAndDelete(id);
      
      if (!success) {
        return res.status(404).json({
          status: 'error',
          message: 'Specialization not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Specialization deleted successfully'
      });
    } catch (error) {
      logger.error('Delete specialization error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete specialization'
      });
    }
  }
}
