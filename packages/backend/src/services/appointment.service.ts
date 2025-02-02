import { Appointment, AppointmentStatus, PaymentStatus, IAppointment } from '../models/Appointment';
import { Doctor, IDoctor } from '../models/Doctor';
import { Room } from '../models/Room';
import { ApiError } from '../middleware/error.middleware';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

export class AppointmentService {
  static async getAllAppointments(filters: {
    startDate?: Date;
    endDate?: Date;
    doctorId?: string;
    patientId?: string;
    status?: AppointmentStatus;
  }): Promise<IAppointment[]> {
    try {
      const query: any = {};

      if (filters.startDate || filters.endDate) {
        query.startTime = {};
        if (filters.startDate) query.startTime.$gte = filters.startDate;
        if (filters.endDate) query.startTime.$lte = filters.endDate;
      }

      if (filters.doctorId) query.doctor = new mongoose.Types.ObjectId(filters.doctorId);
      if (filters.patientId) query.patient = new mongoose.Types.ObjectId(filters.patientId);
      if (filters.status) query.status = filters.status;

      return await Appointment.find(query)
        .populate('doctor', 'firstName lastName')
        .populate('patient', 'firstName lastName')
        .populate('treatment', 'name duration')
        .populate('room', 'name')
        .sort({ startTime: 1 });
    } catch (error) {
      logger.error('Get all appointments error:', error);
      throw error;
    }
  }

  static async getAppointmentById(id: string): Promise<IAppointment> {
    try {
      const appointment = await Appointment.findById(id)
        .populate('doctor', 'firstName lastName')
        .populate('patient', 'firstName lastName')
        .populate('treatment', 'name duration')
        .populate('room', 'name');

      if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
      }

      return appointment;
    } catch (error) {
      logger.error('Get appointment by id error:', error);
      throw error;
    }
  }

  static async createAppointment(appointmentData: {
    doctorId: string;
    patientId: string;
    treatmentId: string;
    roomId: string;
    startTime: Date;
    endTime: Date;
    note?: string;
    price: number;
    status?: AppointmentStatus;
    paymentStatus?: PaymentStatus;
  }): Promise<IAppointment> {
    try {
      // Check if doctor exists and get their working hours
      const doctor = await Doctor.findById(appointmentData.doctorId);
      if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
      }

      // Check if room exists and is available
      const room = await Room.findById(appointmentData.roomId);
      if (!room) {
        throw new ApiError(404, 'Room not found');
      }

      // Validate working hours
      await this.validateDoctorAvailability(
        doctor,
        appointmentData.startTime,
        appointmentData.endTime
      );

      // Check for conflicting appointments
      if (await this.checkForConflicts(
        appointmentData.doctorId,
        appointmentData.roomId,
        appointmentData.startTime,
        appointmentData.endTime
      )) {
        throw new ApiError(409, 'Doctor or room has a conflicting appointment');
      }

      const appointment = new Appointment({
        doctor: new mongoose.Types.ObjectId(appointmentData.doctorId),
        patient: new mongoose.Types.ObjectId(appointmentData.patientId),
        treatment: new mongoose.Types.ObjectId(appointmentData.treatmentId),
        room: new mongoose.Types.ObjectId(appointmentData.roomId),
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        note: appointmentData.note,
        price: appointmentData.price,
        status: appointmentData.status || AppointmentStatus.BOOKED,
        paymentStatus: appointmentData.paymentStatus || PaymentStatus.UNPAID
      });

      await appointment.save();
      return appointment;
    } catch (error) {
      logger.error('Create appointment error:', error);
      throw error;
    }
  }

  private static async validateDoctorAvailability(
    doctor: IDoctor,
    startTime: Date,
    endTime: Date
  ): Promise<void> {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[startTime.getDay()];
    
    if (!dayOfWeek) {
      throw new ApiError(400, 'Invalid date');
    }

    const workingDay = doctor.workingDays.get(dayOfWeek);

    // Check if doctor works on this day
    if (!workingDay?.isWorking) {
      throw new ApiError(400, `Doctor does not work on ${dayOfWeek}`);
    }

    // Check for exceptions
    const exceptionDate = startTime.toISOString().split('T')[0];
    const exception = doctor.workingDaysExceptions?.find(
      (e) => e.date.toISOString().split('T')[0] === exceptionDate
    );

    if (exception) {
      if (!exception.isWorking) {
        throw new ApiError(400, 'Doctor is not available on this date (exception day)');
      }

      // Use exception hours if available
      if (exception.hours) {
        const { start, end } = exception.hours;
        if (!this.isTimeWithinRange(startTime, endTime, start, end)) {
          throw new ApiError(400, 'Appointment time is outside doctor\'s exception working hours');
        }
        return;
      }
    }

    // Check regular working hours
    if (workingDay.hours) {
      const { start, end } = workingDay.hours;
      if (!this.isTimeWithinRange(startTime, endTime, start, end)) {
        throw new ApiError(400, 'Appointment time is outside doctor\'s working hours');
      }
    }
  }

  static async checkForConflicts(
    doctorId: string,
    roomId: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    try {
      // Check for doctor's conflicting appointments
      const doctorConflict = await Appointment.findOne({
        doctor: new mongoose.Types.ObjectId(doctorId),
        status: { $ne: AppointmentStatus.CANCELED },
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        ]
      });

      if (doctorConflict) {
        return true;
      }

      // Check for room's conflicting appointments
      const roomConflict = await Appointment.findOne({
        room: new mongoose.Types.ObjectId(roomId),
        status: { $ne: AppointmentStatus.CANCELED },
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        ]
      });

      return !!roomConflict;
    } catch (error) {
      logger.error('Check for conflicts error:', error);
      throw error;
    }
  }

  private static isTimeWithinRange(
    startTime: Date,
    endTime: Date,
    rangeStart: string,
    rangeEnd: string
  ): boolean {
    const [startHour, startMinute] = rangeStart.split(':').map(Number);
    const [endHour, endMinute] = rangeEnd.split(':').map(Number);

    const appointmentStart = startTime.getHours() * 60 + startTime.getMinutes();
    const appointmentEnd = endTime.getHours() * 60 + endTime.getMinutes();
    const workingStart = startHour * 60 + startMinute;
    const workingEnd = endHour * 60 + endMinute;

    return (
      appointmentStart >= workingStart &&
      appointmentEnd <= workingEnd
    );
  }

  static async updateAppointment(
    id: string,
    updateData: {
      startTime?: Date;
      endTime?: Date;
      status?: AppointmentStatus;
      note?: string;
    }
  ): Promise<IAppointment> {
    try {
      const appointment = await Appointment.findById(id);
      if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
      }

      // If changing times, validate availability and conflicts
      if (updateData.startTime || updateData.endTime) {
        const startTime = updateData.startTime || appointment.startTime;
        const endTime = updateData.endTime || appointment.endTime;

        const doctor = await Doctor.findById(appointment.doctor);
        if (!doctor) {
          throw new ApiError(404, 'Doctor not found');
        }

        await this.validateDoctorAvailability(doctor, startTime, endTime);
        if (await this.checkForConflicts(
          appointment.doctor.toString(),
          appointment.room.toString(),
          startTime,
          endTime
        )) {
          throw new ApiError(409, 'Doctor or room has a conflicting appointment');
        }
      }

      Object.assign(appointment, updateData);
      await appointment.save();
      return appointment;
    } catch (error) {
      logger.error('Update appointment error:', error);
      throw error;
    }
  }

  static async deleteAppointment(id: string): Promise<boolean> {
    try {
      const appointment = await Appointment.findByIdAndDelete(id);
      if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
      }
      return true;
    } catch (error) {
      logger.error('Delete appointment error:', error);
      throw error;
    }
  }

  static async getAvailableSlots(
    doctorId: string,
    date: Date,
    duration: number // duration in minutes
  ): Promise<Date[]> {
    try {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        throw new ApiError(404, 'Doctor not found');
      }

      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = days[date.getDay()];
      
      if (!dayOfWeek) {
        throw new ApiError(400, 'Invalid date');
      }

      const workingDay = doctor.workingDays.get(dayOfWeek);

      // Check if doctor works on this day
      if (!workingDay?.isWorking) {
        return [];
      }

      // Check for exceptions
      const exceptionDate = date.toISOString().split('T')[0];
      const exception = doctor.workingDaysExceptions?.find(
        (e) => e.date.toISOString().split('T')[0] === exceptionDate
      );

      if (exception) {
        if (!exception.isWorking) return [];
        if (exception.hours) {
          return this.generateTimeSlots(
            date,
            exception.hours.start,
            exception.hours.end,
            duration
          );
        }
      }

      // Use regular working hours
      if (workingDay.hours) {
        return this.generateTimeSlots(
          date,
          workingDay.hours.start,
          workingDay.hours.end,
          duration
        );
      }

      return [];
    } catch (error) {
      logger.error('Get available slots error:', error);
      throw error;
    }
  }

  private static generateTimeSlots(
    date: Date,
    startTime: string,
    endTime: string,
    duration: number
  ): Date[] {
    const slots: Date[] = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const start = new Date(date);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(date);
    end.setHours(endHour, endMinute, 0, 0);

    while (start.getTime() + duration * 60000 <= end.getTime()) {
      slots.push(new Date(start));
      start.setMinutes(start.getMinutes() + duration);
    }

    return slots;
  }
}
