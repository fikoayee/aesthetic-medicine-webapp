import { Request, Response } from 'express';
import { Specialization } from '../models/Specialization';
import { Treatment } from '../models/Treatment';
import { logger } from '../config/logger';

export class SpecializationController {
  static async getAllSpecializations(req: Request, res: Response) {
    try {
      const specializations = await Specialization.find()
        .populate('treatments')
        .exec();
      
      
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
      const specialization = await Specialization.findById(req.params.id)
        .populate('treatments')
        .exec();
      
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
      const specialization = await Specialization.findByIdAndUpdate(id, req.body, { new: true })
        .populate('treatments')
        .exec();
      
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
      const specialization = await Specialization.findByIdAndDelete(id);
      
      if (!specialization) {
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

  static async transferTreatments(req: Request, res: Response) {
    try {
      const { fromSpecializationId, toSpecializationId, treatmentIds } = req.body;

      // Validate input
      if (!fromSpecializationId || !toSpecializationId || !treatmentIds) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields'
        });
      }

      // Check if both specializations exist
      const [fromSpec, toSpec] = await Promise.all([
        Specialization.findById(fromSpecializationId),
        Specialization.findById(toSpecializationId)
      ]);

      if (!fromSpec || !toSpec) {
        return res.status(404).json({
          status: 'error',
          message: 'One or both specializations not found'
        });
      }

      // Update treatments' specialization field
      await Treatment.updateMany(
        { _id: { $in: treatmentIds } },
        { $set: { specialization: toSpecializationId } }
      );

      // Remove treatments from source specialization
      await Specialization.findByIdAndUpdate(fromSpecializationId, {
        $pull: { treatments: { $in: treatmentIds } }
      });

      // Add treatments to target specialization
      await Specialization.findByIdAndUpdate(toSpecializationId, {
        $addToSet: { treatments: { $each: treatmentIds } }
      });

      // Get updated specializations
      const updatedSpecs = await Specialization.find({
        _id: { $in: [fromSpecializationId, toSpecializationId] }
      }).populate('treatments');

      return res.status(200).json({
        status: 'success',
        data: {
          specializations: updatedSpecs
        }
      });
    } catch (error) {
      logger.error('Transfer treatments error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to transfer treatments'
      });
    }
  }
}
