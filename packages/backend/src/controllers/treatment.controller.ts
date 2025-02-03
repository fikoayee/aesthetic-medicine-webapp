import { Request, Response } from 'express';
import { Treatment, ITreatment } from '../models/Treatment';
import { Specialization } from '../models/Specialization';
import { logger } from '../config/logger';
import { Types } from 'mongoose';

export class TreatmentController {
  static async getAllTreatments(req: Request, res: Response) {
    try {
      const treatments = await Treatment.find().populate({
        path: 'specialization',
        model: Specialization,
        select: 'name description'
      });
      
      return res.status(200).json({
        status: 'success',
        data: {
          treatments
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get treatments'
      });
    }
  }

  static async getTreatmentById(req: Request, res: Response) {
    try {
      const treatment = await Treatment.findById(req.params.id).populate({
        path: 'specialization',
        model: Specialization,
        select: 'name description'
      });
      
      if (!treatment) {
        return res.status(404).json({
          status: 'error',
          message: 'Treatment not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          treatment
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get treatment'
      });
    }
  }

  static async createTreatment(req: Request, res: Response) {
    try {
      const specialization = await Specialization.findById(req.body.specialization);
      if (!specialization) {
        return res.status(404).json({
          status: 'error',
          message: 'Specialization not found'
        });
      }

      const treatment = await Treatment.create({
        ...req.body,
        specialization: new Types.ObjectId(req.body.specialization)
      });
      
      const populatedTreatment = await treatment.populate({
        path: 'specialization',
        model: Specialization,
        select: 'name description'
      });

      // Add treatment to specialization's treatments array
      await Specialization.findByIdAndUpdate(
        specialization._id,
        { $push: { treatments: treatment._id } }
      );

      return res.status(201).json({
        status: 'success',
        data: {
          treatment: populatedTreatment
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to create treatment'
      });
    }
  }

  static async updateTreatment(req: Request, res: Response) {
    try {
      if (req.body.specialization) {
        const newSpecId = new Types.ObjectId(req.body.specialization);
        const specialization = await Specialization.findById(newSpecId);
        if (!specialization) {
          return res.status(404).json({
            status: 'error',
            message: 'Specialization not found'
          });
        }

        // If specialization is being changed, update the references
        const oldTreatment = await Treatment.findById(req.params.id);
        if (oldTreatment && !oldTreatment.specialization.equals(newSpecId)) {
          // Remove from old specialization
          await Specialization.findByIdAndUpdate(
            oldTreatment.specialization,
            { $pull: { treatments: oldTreatment._id } }
          );
          // Add to new specialization
          await Specialization.findByIdAndUpdate(
            newSpecId,
            { $push: { treatments: oldTreatment._id } }
          );
        }
      }

      const treatment = await Treatment.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          specialization: req.body.specialization ? new Types.ObjectId(req.body.specialization) : undefined
        },
        { new: true }
      ).populate({
        path: 'specialization',
        model: Specialization,
        select: 'name description'
      });

      if (!treatment) {
        return res.status(404).json({
          status: 'error',
          message: 'Treatment not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          treatment
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update treatment'
      });
    }
  }

  static async deleteTreatment(req: Request, res: Response) {
    try {
      const treatment = await Treatment.findById(req.params.id);
      
      if (!treatment) {
        return res.status(404).json({
          status: 'error',
          message: 'Treatment not found'
        });
      }

      // Remove treatment from specialization's treatments array
      await Specialization.findByIdAndUpdate(
        treatment.specialization,
        { $pull: { treatments: treatment._id } }
      );

      await treatment.deleteOne();

      return res.status(200).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete treatment'
      });
    }
  }

  static async getTreatmentsBySpecializationId(req: Request, res: Response) {
    try {
      const { specializationId } = req.params;
      
      const treatments = await Treatment.find({ 
        specialization: new Types.ObjectId(specializationId) 
      });
      
      return res.status(200).json({
        status: 'success',
        data: {
          treatments
        }
      });
    } catch (error) {
      logger.error('Get treatments by specialization error:', error);
      return res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get treatments'
      });
    }
  }
}
