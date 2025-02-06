import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { ApiError } from '../middleware/error.middleware';
import { AppointmentStatus } from '../models/Appointment';
import { Doctor } from '../models/Doctor';
import { Appointment } from '../models/Appointment';

export class AppointmentController {
  static async getAllAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, doctorId, patientId, status } = req.query;

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (doctorId) filters.doctorId = doctorId as string;
      if (patientId) filters.patientId = patientId as string;
      if (status) filters.status = status as AppointmentStatus;

      const appointments = await AppointmentService.getAllAppointments(filters);
      res.json({
        status: 'success',
        data: { appointments }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAppointmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const appointment = await AppointmentService.getAppointmentById(id);
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  }

  static async createAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        doctorId,
        patientId,
        treatmentId,
        roomId,
        startTime,
        endTime,
        note,
        price,
        status,
        paymentStatus
      } = req.body;

      // Basic validation
      if (!doctorId || !patientId || !treatmentId || !roomId || !startTime || !endTime || !price) {
        throw new ApiError(400, 'Missing required fields');
      }

      const appointment = await AppointmentService.createAppointment({
        doctorId,
        patientId,
        treatmentId,
        roomId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        note,
        price,
        status,
        paymentStatus
      });

      res.status(201).json({
        status: 'success',
        data: appointment
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const {
        startTime,
        endTime,
        status,
        note
      } = req.body;

      const updateData: any = {};
      if (startTime) updateData.startTime = new Date(startTime);
      if (endTime) updateData.endTime = new Date(endTime);
      if (status) updateData.status = status;
      if (note !== undefined) updateData.note = note;

      const appointment = await AppointmentService.updateAppointment(id, updateData);
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await AppointmentService.deleteAppointment(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { doctorId } = req.params;
      const { date, duration, roomId } = req.query;
      
      if (!date || !duration) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters: date or duration'
        });
      }

      const selectedDate = new Date(date as string);
      const durationMinutes = parseInt(duration as string);

      // If doctorId is provided, get slots for specific doctor
      if (doctorId) {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
          return res.status(404).json({
            success: false,
            message: 'Doctor not found'
          });
        }

        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = days[selectedDate.getDay()];
        const workingDay = doctor.workingDays.get(dayOfWeek);

        if (!workingDay?.isWorking) {
          return res.json({
            success: true,
            data: {
              availability: {
                slots: []
              }
            }
          });
        }

        // Get working hours for the day
        const workingHours = workingDay.hours;
        if (!workingHours) {
          return res.json({
            success: true,
            data: {
              availability: {
                slots: []
              }
            }
          });
        }

        // Set up working hours for the day
        const [startHour, startMinute] = workingHours.start.split(':').map(Number);
        const [endHour, endMinute] = workingHours.end.split(':').map(Number);

        const dayStart = new Date(selectedDate);
        dayStart.setHours(startHour, startMinute, 0, 0);

        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(endHour, endMinute, 0, 0);

        // Get existing appointments for both doctor and room
        const doctorAppointments = await Appointment.find({
          doctor: doctorId,
          status: { $ne: AppointmentStatus.CANCELED },
          startTime: { $gte: dayStart },
          endTime: { $lte: dayEnd }
        }).sort('startTime');

        let roomAppointments: any[] = [];
        if (roomId) {
          roomAppointments = await Appointment.find({
            room: roomId,
            status: { $ne: AppointmentStatus.CANCELED },
            startTime: { $gte: dayStart },
            endTime: { $lte: dayEnd }
          }).sort('startTime');
        }

        // Generate available time slots
        const slots: Date[] = [];
        let currentTime = new Date(dayStart);

        while (currentTime.getTime() + durationMinutes * 60000 <= dayEnd.getTime()) {
          // Check if this slot conflicts with any existing appointment
          const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);
          
          const hasDoctorConflict = doctorAppointments.some(apt => 
            (apt.startTime < slotEnd && apt.endTime > currentTime)
          );

          const hasRoomConflict = roomId ? roomAppointments.some(apt => 
            (apt.startTime < slotEnd && apt.endTime > currentTime)
          ) : false;

          if (!hasDoctorConflict && !hasRoomConflict) {
            slots.push(new Date(currentTime));
          }

          // Move to next slot (15-minute intervals)
          currentTime.setMinutes(currentTime.getMinutes() + 15);
        }

        return res.json({
          success: true,
          data: {
            availability: {
              slots: slots.map(slot => slot.toISOString())
            }
          }
        });
      }

      // If no doctorId, return all available slots for all doctors (original functionality)
      const doctors = await Doctor.find();
      const availability = [];

      for (const doctor of doctors) {
        const slots = await AppointmentController.getDoctorSlots(doctor, selectedDate, durationMinutes, roomId as string);
        if (slots.length > 0) {
          availability.push({
            doctorId: doctor._id,
            availableSlots: slots.map(slot => ({
              startTime: slot.toISOString()
            }))
          });
        }
      }

      return res.json({
        success: true,
        data: {
          availability
        }
      });

    } catch (error) {
      next(error);
    }
  }

  private static async getDoctorSlots(doctor: any, date: Date, duration: number, roomId?: string): Promise<Date[]> {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[date.getDay()];
    const workingDay = doctor.workingDays.get(dayOfWeek);

    if (!workingDay?.isWorking || !workingDay.hours) {
      return [];
    }

    const [startHour, startMinute] = workingDay.hours.start.split(':').map(Number);
    const [endHour, endMinute] = workingDay.hours.end.split(':').map(Number);

    const dayStart = new Date(date);
    dayStart.setHours(startHour, startMinute, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(endHour, endMinute, 0, 0);

    const doctorAppointments = await Appointment.find({
      doctor: doctor._id,
      status: { $ne: AppointmentStatus.CANCELED },
      startTime: { $gte: dayStart },
      endTime: { $lte: dayEnd }
    }).sort('startTime');

    let roomAppointments: any[] = [];
    if (roomId) {
      roomAppointments = await Appointment.find({
        room: roomId,
        status: { $ne: AppointmentStatus.CANCELED },
        startTime: { $gte: dayStart },
        endTime: { $lte: dayEnd }
      }).sort('startTime');
    }

    const slots: Date[] = [];
    let currentTime = new Date(dayStart);

    while (currentTime.getTime() + duration * 60000 <= dayEnd.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);
      
      const hasDoctorConflict = doctorAppointments.some(apt => 
        (apt.startTime < slotEnd && apt.endTime > currentTime)
      );

      const hasRoomConflict = roomId ? roomAppointments.some(apt => 
        (apt.startTime < slotEnd && apt.endTime > currentTime)
      ) : false;

      if (!hasDoctorConflict && !hasRoomConflict) {
        slots.push(new Date(currentTime));
      }

      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }

    return slots;
  }

  static async checkForConflicts(req: Request, res: Response, next: NextFunction) {
    try {
      const { doctorId, roomId, patientId, startTime, endTime } = req.body;

      // Basic validation
      if (!doctorId || !roomId || !startTime || !endTime) {
        throw new ApiError(400, 'Missing required fields');
      }

      const hasConflicts = await AppointmentService.checkForConflicts(
        doctorId,
        roomId,
        new Date(startTime),
        new Date(endTime)
      );

      res.json({
        status: 'success',
        data: { hasConflicts }
      });
    } catch (error) {
      next(error);
    }
  }
}
