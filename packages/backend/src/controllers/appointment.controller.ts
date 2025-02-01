import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { ApiError } from '../middleware/error.middleware';
import { AppointmentStatus } from '../models/Appointment';

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
        note
      } = req.body;

      // Basic validation
      if (!doctorId || !patientId || !treatmentId || !roomId || !startTime || !endTime) {
        throw new ApiError(400, 'Missing required fields');
      }

      const appointment = await AppointmentService.createAppointment({
        doctorId,
        patientId,
        treatmentId,
        roomId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        note
      });

      res.status(201).json(appointment);
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
      const { doctorId, date, duration } = req.query;

      if (!doctorId || !date || !duration) {
        throw new ApiError(400, 'Missing required query parameters');
      }

      const slots = await AppointmentService.getAvailableSlots(
        doctorId as string,
        new Date(date as string),
        parseInt(duration as string)
      );

      res.json(slots);
    } catch (error) {
      next(error);
    }
  }
}
