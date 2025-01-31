import { Treatment, ITreatment } from '../models/Treatment';
import { logger } from '../config/logger';

export class TreatmentService {
  static async getAllTreatments(): Promise<ITreatment[]> {
    try {
      return await Treatment.find();
    } catch (error) {
      logger.error('Get all treatments service error:', error);
      throw error;
    }
  }

  static async getTreatmentById(id: string): Promise<ITreatment | null> {
    try {
      return await Treatment.findById(id);
    } catch (error) {
      logger.error('Get treatment by id service error:', error);
      throw error;
    }
  }

  static async createTreatment(treatmentData: Partial<ITreatment>): Promise<ITreatment> {
    try {
      const treatment = new Treatment(treatmentData);
      await treatment.save();
      return treatment;
    } catch (error) {
      logger.error('Create treatment service error:', error);
      throw error;
    }
  }

  static async updateTreatment(id: string, updateData: Partial<ITreatment>): Promise<ITreatment | null> {
    try {
      const treatment = await Treatment.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return treatment;
    } catch (error) {
      logger.error('Update treatment service error:', error);
      throw error;
    }
  }

  static async deleteTreatment(id: string): Promise<boolean> {
    try {
      const result = await Treatment.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      logger.error('Delete treatment service error:', error);
      throw error;
    }
  }
}
