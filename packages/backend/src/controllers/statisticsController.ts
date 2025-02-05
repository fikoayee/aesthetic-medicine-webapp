import { Request, Response } from 'express';
import { Appointment, IAppointment } from '../models/Appointment';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { Treatment, ITreatment } from '../models/Treatment';
import { startOfMonth, endOfMonth } from 'date-fns';
import { Document, PopulatedDoc } from 'mongoose';

interface PopulatedAppointment extends Omit<IAppointment, 'treatment'> {
  treatment: PopulatedDoc<Document<any, any, ITreatment> & ITreatment>;
}

export const getDashboardStatistics = async (req: Request, res: Response) => {
  try {
    console.log('Starting getDashboardStatistics...');
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    console.log('Date range:', { monthStart, monthEnd });

    // Get monthly appointments with populated references
    console.log('Fetching appointments...');
    const monthlyAppointments = await Appointment.find({
      startTime: {
        $gte: monthStart,
        $lte: monthEnd
      }
    }).populate({
      path: 'patient',
      select: '_id'
    }).populate({
      path: 'treatment',
      select: 'name duration'
    }).lean() as unknown as PopulatedAppointment[];

    console.log('Found appointments:', monthlyAppointments.length);

    if (!monthlyAppointments) {
      throw new Error('Failed to fetch monthly appointments');
    }

    // Get unique monthly patients
    const uniquePatientIds = new Set<string>();
    monthlyAppointments.forEach((app: PopulatedAppointment) => {
      if (app.patient && app.patient._id) {
        uniquePatientIds.add(app.patient._id.toString());
      }
    });
    const monthlyPatients = uniquePatientIds.size;
    console.log('Unique monthly patients:', monthlyPatients);

    // Get total doctors
    console.log('Counting doctors...');
    const totalDoctors = await Doctor.countDocuments();
    console.log('Total doctors:', totalDoctors);
    if (typeof totalDoctors !== 'number') {
      throw new Error('Failed to count doctors');
    }

    // Get total patients
    console.log('Counting patients...');
    const totalPatients = await Patient.countDocuments();
    console.log('Total patients:', totalPatients);
    if (typeof totalPatients !== 'number') {
      throw new Error('Failed to count patients');
    }

    // Calculate average appointments per day
    const daysInMonth = monthEnd.getDate();
    const avgAppointmentsPerDay = monthlyAppointments.length / daysInMonth;
    console.log('Average appointments per day:', avgAppointmentsPerDay);

    // Calculate popular treatments
    console.log('Processing treatments...');
    const treatmentCounts: { [key: string]: { name: string; count: number } } = {};
    
    monthlyAppointments.forEach((appointment: PopulatedAppointment) => {
      if (appointment.treatment && typeof appointment.treatment === 'object' && 'name' in appointment.treatment) {
        const treatmentId = appointment.treatment._id.toString();
        if (!treatmentCounts[treatmentId]) {
          treatmentCounts[treatmentId] = {
            name: appointment.treatment.name,
            count: 0
          };
        }
        treatmentCounts[treatmentId].count++;
      }
    });

    const popularTreatments = Object.values(treatmentCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    console.log('Popular treatments:', popularTreatments);

    // Calculate average treatment duration (in minutes)
    console.log('Calculating average treatment duration...');
    const avgTreatmentDuration = await Treatment.aggregate([
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);
    console.log('Average treatment duration:', avgTreatmentDuration[0]?.avgDuration || 45);

    const statistics = {
      monthlyAppointments: monthlyAppointments.length,
      monthlyPatients,
      totalDoctors,
      avgAppointmentsPerDay: Math.round(avgAppointmentsPerDay * 10) / 10,
      popularTreatments,
      totalPatients,
      avgTreatmentDuration: avgTreatmentDuration[0]?.avgDuration || 45
    };

    console.log('Final statistics:', statistics);

    res.json({
      status: 'success',
      data: {
        statistics
      },
      message: 'Dashboard statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getDashboardStatistics:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Error fetching dashboard statistics'
    });
  }
};
