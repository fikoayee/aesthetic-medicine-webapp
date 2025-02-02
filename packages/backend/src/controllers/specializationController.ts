import { Request, Response } from 'express';
import { Specialization } from '../models/Specialization';
import { Doctor } from '../models/Doctor';
import { Room } from '../models/Room';

export const specializationController = {
  // Get all specializations
  getAllSpecializations: async (_req: Request, res: Response) => {
    try {
      const specializations = await Specialization.find().populate('treatments');
      return res.json({
        success: true,
        data: specializations
      });
    } catch (error) {
      console.error('Error getting specializations:', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting specializations'
      });
    }
  },

  // Get doctor specializations
  getDoctorSpecializations: async (req: Request, res: Response) => {
    try {
      const { doctorId } = req.params;
      const doctor = await Doctor.findById(doctorId).populate('specializations');
      
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }

      return res.json({
        success: true,
        data: doctor.specializations
      });
    } catch (error) {
      console.error('Error getting doctor specializations:', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting doctor specializations'
      });
    }
  },

  // Get room specializations
  getRoomSpecializations: async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params;
      const room = await Room.findById(roomId).populate('specializations');
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      return res.json({
        success: true,
        data: room.specializations
      });
    } catch (error) {
      console.error('Error getting room specializations:', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting room specializations'
      });
    }
  }
};
