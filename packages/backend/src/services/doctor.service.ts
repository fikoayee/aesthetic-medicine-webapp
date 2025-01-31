import { Doctor, IDoctor } from '../models/Doctor';
import { logger } from '../config/logger';

export class DoctorService {
  static async getAllDoctors(): Promise<IDoctor[]> {
    try {
      return await Doctor.find().populate('specializations');
    } catch (error) {
      logger.error('Get all doctors service error:', error);
      throw error;
    }
  }

  static async getDoctorById(id: string): Promise<IDoctor | null> {
    try {
      return await Doctor.findById(id).populate('specializations');
    } catch (error) {
      logger.error('Get doctor by id service error:', error);
      throw error;
    }
  }

  static async createDoctor(doctorData: Partial<IDoctor>): Promise<IDoctor> {
    try {
      const doctor = new Doctor(doctorData);
      await doctor.save();
      return doctor.populate('specializations');
    } catch (error) {
      logger.error('Create doctor service error:', error);
      throw error;
    }
  }

  static async updateDoctor(id: string, updateData: Partial<IDoctor>): Promise<IDoctor | null> {
    try {
      const doctor = await Doctor.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('specializations');

      return doctor;
    } catch (error) {
      logger.error('Update doctor service error:', error);
      throw error;
    }
  }

  static async deleteDoctor(id: string): Promise<boolean> {
    try {
      const result = await Doctor.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      logger.error('Delete doctor service error:', error);
      throw error;
    }
  }
}
