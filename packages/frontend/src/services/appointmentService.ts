import axiosInstance from './authService';
import { Doctor } from './doctorService';
import { Treatment } from './treatmentService';
import { Room } from './roomService';
import { Patient } from '../types/patient';

export enum AppointmentStatus {
  BOOKED = 'booked',
  ONGOING = 'ongoing',
  CANCELED = 'canceled'
}

export enum PaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid'
}

export interface NewPatientData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  gender: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
}

export interface Appointment {
  _id: string;
  doctor: Doctor;
  patient: Patient;
  treatment: Treatment;
  room: Room;
  startTime: string;
  endTime: string;
  price: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentFormData {
  doctorId: string;
  treatmentId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  price: number;
  note?: string;
}

export interface CreateAppointmentData {
  patientId?: string;
  newPatient?: NewPatientData;
  appointment: AppointmentFormData;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}

const createAppointment = async (data: CreateAppointmentData): Promise<Appointment> => {
  try {
    // If we have a new patient, create them first
    let patientId = data.patientId;
    
    if (!patientId && data.newPatient) {
      const patientResponse = await axiosInstance.post<ApiResponse<{ patient: Patient }>>('/patients', data.newPatient);
      patientId = patientResponse.data.data.patient._id;
    }

    // Create the appointment
    const appointmentData = {
      ...data.appointment,
      patientId,
      status: AppointmentStatus.BOOKED,
      paymentStatus: PaymentStatus.UNPAID
    };

    const response = await axiosInstance.post<ApiResponse<{ appointment: Appointment }>>('/appointments', appointmentData);
    return response.data.data.appointment;
  } catch (error) {
    throw error;
  }
};

const getDoctors = async (): Promise<Doctor[]> => {
  const response = await axiosInstance.get<ApiResponse<{ doctors: Doctor[] }>>('/doctors');
  return response.data.data.doctors;
};

const getTreatments = async (): Promise<Treatment[]> => {
  const response = await axiosInstance.get<ApiResponse<{ treatments: Treatment[] }>>('/treatments');
  return response.data.data.treatments;
};

const getRooms = async (): Promise<Room[]> => {
  const response = await axiosInstance.get<ApiResponse<{ rooms: Room[] }>>('/rooms');
  return response.data.data.rooms;
};

const searchPatients = async (query: string): Promise<Patient[]> => {
  const response = await axiosInstance.get<ApiResponse<{ patients: Patient[] }>>('/patients/search', {
    params: { query }
  });
  return response.data.data.patients;
};

const getAvailableSlots = async (doctorId: string, date: string): Promise<{ startTime: string; endTime: string; roomId: string; }[]> => {
  const response = await axiosInstance.get<ApiResponse<{ slots: { startTime: string; endTime: string; roomId: string; }[] }>>('/appointments/available-slots', {
    params: {
      doctorId,
      date
    }
  });
  return response.data.data.slots;
};

export const appointmentService = {
  createAppointment,
  getDoctors,
  getTreatments,
  getRooms,
  searchPatients,
  getAvailableSlots,
};
