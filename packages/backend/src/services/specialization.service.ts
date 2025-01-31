import { Specialization, ISpecialization } from '../models/Specialization';
import { logger } from '../config/logger';

export class SpecializationService {
  static async getAllSpecializations(): Promise<ISpecialization[]> {
    try {
      return await Specialization.find();
    } catch (error) {
      logger.error('Get all specializations service error:', error);
      throw error;
    }
  }

  static async getSpecializationById(id: string): Promise<ISpecialization | null> {
    try {
      return await Specialization.findById(id);
    } catch (error) {
      logger.error('Get specialization by id service error:', error);
      throw error;
    }
  }

  static async createSpecialization(specializationData: Partial<ISpecialization>): Promise<ISpecialization> {
    try {
      const specialization = new Specialization(specializationData);
      await specialization.save();
      return specialization;
    } catch (error) {
      logger.error('Create specialization service error:', error);
      throw error;
    }
  }

  static async updateSpecialization(id: string, updateData: Partial<ISpecialization>): Promise<ISpecialization | null> {
    try {
      const specialization = await Specialization.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return specialization;
    } catch (error) {
      logger.error('Update specialization service error:', error);
      throw error;
    }
  }

  static async deleteSpecialization(id: string): Promise<boolean> {
    try {
      const result = await Specialization.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      logger.error('Delete specialization service error:', error);
      throw error;
    }
  }
}
