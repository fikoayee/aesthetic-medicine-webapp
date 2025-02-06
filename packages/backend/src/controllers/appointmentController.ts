import { Request, Response } from 'express';
import { Appointment, AppointmentStatus, PaymentStatus } from '../models/Appointment';
import { Doctor } from '../models/Doctor';
import { Room } from '../models/Room';
import { Treatment } from '../models/Treatment';
import { Patient } from '../models/Patient';
import { Specialization } from '../models/Specialization';

// Helper function to check for time conflicts
const checkTimeConflict = (start1: Date, end1: Date, start2: Date, end2: Date): boolean => {
  return (start1 < end2 && end1 > start2);
};

export const appointmentController = {
  // Create a new appointment
  createAppointment: async (req: Request, res: Response) => {
    try {
      const { doctorId, patientId, treatmentId, roomId, startTime, endTime, note } = req.body;

      // Validate all required entities exist
      const [doctor, patient, treatment, room] = await Promise.all([
        Doctor.findById(doctorId),
        Patient.findById(patientId),
        Treatment.findById(treatmentId),
        Room.findById(roomId)
      ]);

      if (!doctor || !patient || !treatment || !room) {
        return res.status(404).json({
          success: false,
          message: 'One or more required entities not found'
        });
      }

      // Check for conflicts
      const conflicts = await appointmentController.checkConflicts(req, res);
      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Appointment conflicts detected',
          data: conflicts
        });
      }

      const appointment = new Appointment({
        doctor: doctorId,
        patient: patientId,
        treatment: treatmentId,
        room: roomId,
        startTime,
        endTime,
        price: treatment.price,
        status: AppointmentStatus.BOOKED,
        paymentStatus: PaymentStatus.UNPAID,
        note
      });

      await appointment.save();

      return res.status(201).json({
        success: true,
        data: appointment
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating appointment'
      });
    }
  },

  // Check for appointment conflicts
  checkConflicts: async (req: Request, res: Response) => {
    try {
      const { doctorId, roomId, patientId, startTime, endTime, excludeAppointmentId } = req.body;
      const start = new Date(startTime);
      const end = new Date(endTime);

      // Get all appointments for the same day that might conflict
      const dayStart = new Date(start);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(start);
      dayEnd.setHours(23, 59, 59, 999);

      const appointments = await Appointment.find({
        _id: { $ne: excludeAppointmentId },
        status: { $ne: AppointmentStatus.CANCELED },
        startTime: { $gte: dayStart },
        endTime: { $lte: dayEnd },
        $or: [
          { doctor: doctorId },
          { room: roomId },
          { patient: patientId }
        ]
      }).populate('doctor patient room');

      const conflicts = [];

      for (const apt of appointments) {
        if (checkTimeConflict(start, end, apt.startTime, apt.endTime)) {
          if (apt.doctor.toString() === doctorId) {
            conflicts.push({
              type: 'doctor',
              name: `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`,
              startTime: apt.startTime,
              endTime: apt.endTime
            });
          }
          if (apt.room.toString() === roomId) {
            conflicts.push({
              type: 'room',
              name: apt.room.name,
              startTime: apt.startTime,
              endTime: apt.endTime
            });
          }
          if (apt.patient.toString() === patientId) {
            conflicts.push({
              type: 'patient',
              name: `${apt.patient.firstName} ${apt.patient.lastName}`,
              startTime: apt.startTime,
              endTime: apt.endTime
            });
          }
        }
      }

      return res.json({
        success: true,
        data: conflicts
      });
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking conflicts'
      });
    }
  },

  // Get doctor availability
  getDoctorAvailability: async (req: Request, res: Response) => {
    try {
      const { date } = req.query;
      const selectedDate = new Date(date as string);
      const dayStart = new Date(selectedDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(selectedDate.setHours(23, 59, 59, 999));

      // Get all doctors
      const doctors = await Doctor.find();
      const availability = [];

      for (const doctor of doctors) {
        // Get doctor's appointments for the day
        const appointments = await Appointment.find({
          doctor: doctor._id,
          status: { $ne: AppointmentStatus.CANCELED },
          startTime: { $gte: dayStart },
          endTime: { $lte: dayEnd }
        }).sort('startTime');

        // Calculate available slots
        const availableSlots = [];
        const workStart = new Date(selectedDate);
        workStart.setHours(9, 0, 0, 0); // Assuming 9 AM start
        const workEnd = new Date(selectedDate);
        workEnd.setHours(17, 0, 0, 0); // Assuming 5 PM end

        if (appointments.length === 0) {
          // If no appointments, entire work day is available
          availableSlots.push({
            startTime: workStart,
            endTime: workEnd
          });
        } else {
          let currentTime = new Date(workStart);

          // Add slots between appointments
          for (let i = 0; i < appointments.length; i++) {
            const apt = appointments[i];
            
            // Add slot before appointment if there's time
            if (currentTime < apt.startTime) {
              availableSlots.push({
                startTime: currentTime,
                endTime: apt.startTime
              });
            }
            
            currentTime = new Date(apt.endTime);

            // If this is the last appointment and there's time after it
            if (i === appointments.length - 1 && currentTime < workEnd) {
              availableSlots.push({
                startTime: currentTime,
                endTime: workEnd
              });
            }
          }
        }

        availability.push({
          doctorId: doctor._id,
          availableSlots
        });
      }

      return res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      console.error('Error getting doctor availability:', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting doctor availability'
      });
    }
  },

  // Get available doctors for a treatment
  getAvailableDoctors: async (req: Request, res: Response) => {
    try {
      const { treatmentId } = req.query;
      
      // Get the treatment and its specialization
      const treatment = await Treatment.findById(treatmentId);
      if (!treatment) {
        return res.status(404).json({
          success: false,
          message: 'Treatment not found'
        });
      }

      // Find doctors with the required specialization
      const doctors = await Doctor.find({
        specializations: treatment.specialization
      });

      return res.json({
        success: true,
        data: doctors
      });
    } catch (error) {
      console.error('Error getting available doctors:', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting available doctors'
      });
    }
  },

  // Get available rooms for a treatment
  getAvailableRooms: async (req: Request, res: Response) => {
    try {
      const { treatmentId } = req.query;
      
      // Get the treatment and its specialization
      const treatment = await Treatment.findById(treatmentId);
      if (!treatment) {
        return res.status(404).json({
          success: false,
          message: 'Treatment not found'
        });
      }

      // Find rooms equipped for the specialization
      const rooms = await Room.find({
        specializations: treatment.specialization
      });

      return res.json({
        success: true,
        data: rooms
      });
    } catch (error) {
      console.error('Error getting available rooms:', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting available rooms'
      });
    }
  },

  // Get available slots for a specific doctor
  getDoctorAvailableSlots: async (req: Request, res: Response) => {
    try {
      const { doctorId } = req.params;
      const { date, duration } = req.query;
      
      if (!doctorId || !date || !duration) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters: doctorId, date, or duration'
        });
      }

      const selectedDate = new Date(date as string);
      const durationMinutes = parseInt(duration as string);

      // Get doctor's working hours for this day
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

      // Get existing appointments for the day
      const appointments = await Appointment.find({
        doctor: doctorId,
        status: { $ne: AppointmentStatus.CANCELED },
        startTime: { $gte: dayStart },
        endTime: { $lte: dayEnd }
      }).sort('startTime');

      // Generate available time slots
      const slots: Date[] = [];
      let currentTime = new Date(dayStart);

      while (currentTime.getTime() + durationMinutes * 60000 <= dayEnd.getTime()) {
        // Check if this slot conflicts with any existing appointment
        const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);
        const hasConflict = appointments.some(apt => 
          checkTimeConflict(currentTime, slotEnd, apt.startTime, apt.endTime)
        );

        if (!hasConflict) {
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
    } catch (error) {
      console.error('Error getting doctor available slots:', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting available slots'
      });
    }
  },
};
