import { Doctor, IDoctor, IDoctorLean } from '../models/Doctor';
import { logger } from '../config/logger';
import { startOfDay, endOfDay, parseISO, format } from 'date-fns';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

export class DoctorService {
  static async getAllDoctors(options?: { populate?: { path: string } }): Promise<IDoctorLean[]> {
    try {
      let query = Doctor.find();
      
      if (options?.populate) {
        query = query.populate(options.populate);
      }
      
      return await query.lean();
    } catch (error) {
      logger.error('Get all doctors service error:', error);
      throw error;
    }
  }

  static async getDoctorById(id: string): Promise<IDoctor | null> {
    try {
      return await Doctor.findById(id);
    } catch (error) {
      logger.error('Get doctor by id service error:', error);
      throw error;
    }
  }

  static async getDoctorAvailability(doctorId: string, date: string): Promise<TimeSlot[]> {
    try {
      logger.info(`Getting availability for doctor ${doctorId} on date ${date}`);
      
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        logger.error(`Doctor ${doctorId} not found`);
        throw new Error('Doctor not found');
      }

      const parsedDate = parseISO(date);
      const dayOfWeek = format(parsedDate, 'EEEE').toLowerCase();
      logger.info(`Day of week: ${dayOfWeek}`);
      
      const workingDay = doctor.workingDays.get(dayOfWeek);
      logger.info(`Working day data:`, workingDay);

      if (!workingDay || !workingDay.isWorking) {
        logger.info(`Doctor ${doctorId} is not working on ${dayOfWeek}`);
        return [];
      }

      // Check for exceptions
      const dateStr = format(parsedDate, 'yyyy-MM-dd');
      const exception = doctor.workingDaysExceptions?.find(e => 
        format(e.date, 'yyyy-MM-dd') === dateStr
      );

      if (exception) {
        logger.info(`Found exception for date ${dateStr}:`, exception);
        if (!exception.isWorking) return [];
        if (exception.hours) {
          const slots = [{
            startTime: `${dateStr}T${exception.hours.start}`,
            endTime: `${dateStr}T${exception.hours.end}`
          }];
          logger.info(`Returning exception slots:`, slots);
          return slots;
        }
      }

      // Return regular working hours
      if (workingDay.hours) {
        const slots = [{
          startTime: `${dateStr}T${workingDay.hours.start}`,
          endTime: `${dateStr}T${workingDay.hours.end}`
        }];
        logger.info(`Returning regular working hours:`, slots);
        return slots;
      }

      logger.info(`No available slots found`);
      return [];
    } catch (error) {
      logger.error('Get doctor availability service error:', error);
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

  static async getDoctorsByTreatment(treatmentId: string): Promise<IDoctorLean[]> {
    try {
      logger.info(`Getting doctors for treatment: ${treatmentId}`);
      
      // First get the treatment to find its specialization
      const { Treatment } = await import('../models/Treatment');
      const treatment = await Treatment.findById(treatmentId);
      
      if (!treatment) {
        logger.error(`Treatment ${treatmentId} not found`);
        return [];
      }

      logger.info(`Found treatment: ${treatment.name} with specialization ID: ${treatment.specialization}`);

      // Find doctors who have this specialization
      const doctors = await Doctor.find({
        specializations: treatment.specialization
      })
      .populate('specializations')
      .lean();

      logger.info(`Found ${doctors.length} doctors with matching specialization`);
      if (doctors.length === 0) {
        // Debug: Check all doctors and their specializations
        const allDoctors = await Doctor.find().populate('specializations').lean();
        logger.info(`Total doctors in system: ${allDoctors.length}`);
        allDoctors.forEach(doc => {
          logger.info(`Doctor ${doc.firstName} ${doc.lastName} has specializations:`, 
            doc.specializations.map((s: any) => `${s.name} (${s._id})`).join(', ')
          );
        });
      }

      return doctors;
    } catch (error) {
      logger.error('Get doctors by treatment service error:', error);
      return [];
    }
  }
}
