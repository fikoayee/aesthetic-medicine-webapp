import { Patient, IPatient } from '../models/Patient';
import { logger } from '../config/logger';

export class PatientService {
  static async getAllPatients(): Promise<IPatient[]> {
    try {
      return await Patient.find();
    } catch (error) {
      logger.error('Get all patients service error:', error);
      throw error;
    }
  }

  static async getPatientById(id: string): Promise<IPatient | null> {
    try {
      return await Patient.findById(id);
    } catch (error) {
      logger.error('Get patient by id service error:', error);
      throw error;
    }
  }

  static async searchPatients(query: string): Promise<IPatient[]> {
    try {
      return await Patient.find({
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { phoneNumber: { $regex: query, $options: 'i' } }
        ]
      });
    } catch (error) {
      logger.error('Search patients service error:', error);
      throw error;
    }
  }

  static async createPatient(patientData: Partial<IPatient>): Promise<IPatient> {
    try {
      const patient = new Patient(patientData);
      await patient.save();
      return patient;
    } catch (error) {
      logger.error('Create patient service error:', error);
      throw error;
    }
  }

  static async updatePatient(id: string, updateData: Partial<IPatient>): Promise<IPatient | null> {
    try {
      const patient = await Patient.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return patient;
    } catch (error) {
      logger.error('Update patient service error:', error);
      throw error;
    }
  }

  static async deletePatient(id: string): Promise<boolean> {
    try {
      const result = await Patient.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      logger.error('Delete patient service error:', error);
      throw error;
    }
  }
}
