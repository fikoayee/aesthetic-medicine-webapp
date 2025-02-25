import axiosInstance from './authService';
import { Doctor } from '../types/doctor';
import { Treatment } from '../types/treatment';
import { Room } from '../types/room';
import { Patient } from '../types/patient';
import { Appointment, AppointmentStatus, PaymentStatus } from '../types/appointment';
import { ApiResponse } from '../types/api';

export { AppointmentStatus, PaymentStatus };

export interface AppointmentFormData {
  doctorId: string;
  patientId?: string;
  treatmentId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  status?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  note?: string;
  price?: number;
}

export interface CreateAppointmentData {
  patientId?: string;
  newPatient?: NewPatientData;
  appointment: AppointmentFormData;
}

export interface NewPatientData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDate?: string;
  gender?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
  };
}

export interface DoctorAvailability {
  doctorId: string;
  availableSlots: {
    startTime: string;
    endTime: string;
  }[];
}

export interface AppointmentFilters {
  startDate?: Date;
  endDate?: Date;
  doctorId?: string;
  patientId?: string;
  status?: AppointmentStatus;
}

const createAppointment = async (data: CreateAppointmentData): Promise<Appointment> => {
  try {
    // If we have a new patient, create them first
    let patientId = data.patientId;
    if (!patientId && data.newPatient) {
      const patientResponse = await axiosInstance.post<ApiResponse<Patient>>('/patients', data.newPatient);
      patientId = patientResponse.data.data._id;
    }

    // Create the appointment
    const appointmentData = {
      ...data.appointment,
      patientId: patientId
    };

    const response = await axiosInstance.post<ApiResponse<Appointment>>('/appointments', appointmentData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

const checkForConflicts = async (
  doctorId: string,
  roomId: string,
  patientId: string,
  startTime: string,
  endTime: string
): Promise<boolean> => {
  try {
    const response = await axiosInstance.post<ApiResponse<{ hasConflicts: boolean }>>('/appointments/check-conflicts', {
      doctorId,
      roomId,
      patientId,
      startTime,
      endTime
    });
    return response.data.data.hasConflicts;
  } catch (error) {
    console.error('Error checking conflicts:', error);
    throw error;
  }
};

const getDoctors = async (): Promise<Doctor[]> => {
  const response = await axiosInstance.get<ApiResponse<Doctor[]>>('/doctors');
  return response.data.data || [];
};

const getTreatments = async (): Promise<Treatment[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{ treatments: Treatment[] }>>('/treatments');
    console.log('Treatments response:', response.data);
    return response.data.data.treatments || [];
  } catch (error) {
    console.error('Error getting treatments:', error);
    return [];
  }
};

const getRooms = async (): Promise<Room[]> => {
  const response = await axiosInstance.get<ApiResponse<{ rooms: Room[] }>>('/rooms');
  return response.data.data.rooms || [];
};

const searchPatients = async (query: string): Promise<Patient[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{ patients: Patient[] }>>(`/patients/search?query=${query}`);
    return response.data.data.patients;
  } catch (error) {
    console.error('Error searching patients:', error);
    return [];
  }
};

const getDoctorAvailability = async (date: string): Promise<DoctorAvailability[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{ availability: DoctorAvailability[] }>>(`/doctors/get-availability?date=${date}`);
    return response.data.data.availability;
  } catch (error) {
    console.error('Error getting doctor availability:', error);
    return [];
  }
};

const getAvailableDoctorsForTreatment = async (treatmentId: string): Promise<Doctor[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{ doctors: Doctor[] }>>(`/doctors/by-treatment?treatmentId=${treatmentId}`);
    console.log('Available doctors response:', response.data);
    return response.data.data.doctors || [];
  } catch (error) {
    console.error('Error getting available doctors:', error);
    return [];
  }
};

const getAvailableRoomsForTreatment = async (treatmentId: string): Promise<Room[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{ rooms: Room[] }>>(`/rooms?treatmentId=${treatmentId}`);
    return response.data.data.rooms || [];
  } catch (error) {
    console.error('Error getting available rooms:', error);
    return [];
  }
};

const getDoctorAppointments = async (doctorId: string, date?: string): Promise<Appointment[]> => {
  try {
    const params = date ? { date } : {};
    const response = await axiosInstance.get<ApiResponse<{ appointments: Appointment[] }>>(`/appointments/doctor/${doctorId}`, { params });
    return response.data.data.appointments;
  } catch (error) {
    console.error('Error in getDoctorAppointments:', error);
    throw error;
  }
};

const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus): Promise<Appointment> => {
  try {
    const response = await axiosInstance.patch<ApiResponse<{ appointment: Appointment }>>(`/appointments/${appointmentId}/status`, { status });
    return response.data.data.appointment;
  } catch (error) {
    console.error('Error in updateAppointmentStatus:', error);
    throw error;
  }
};

const getAppointments = async (filters?: { startDate?: Date; endDate?: Date }) => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.startDate) {
      params.append('startDate', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate.toISOString());
    }

    const queryString = params.toString();
    const url = `/appointments${queryString ? `?${queryString}` : ''}`;
    
    console.log('Fetching appointments with URL:', url);
    const response = await axiosInstance.get<ApiResponse<Appointment[]>>(url);
    console.log('API Response:', response.data);
    
    // Check if we have appointments in the response
    const appointments = response.data?.data?.appointments || response.data?.data || [];
    console.log('Parsed appointments:', appointments);
    
    return appointments;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

const getAvailableSlots = async (doctorId: string, date: string, duration: number, roomId?: string) => {
  try {
    const response = await axiosInstance.get<ApiResponse<{ availability: { slots: string[] } }>>(`/appointments/doctors/${doctorId}/available-slots`, {
      params: {
        date,
        duration,
        roomId
      }
    });
    return {
      slots: response.data.data.availability.slots || []
    };
  } catch (error) {
    console.error('Error getting available slots:', error);
    return { slots: [] };
  }
};

export const appointmentService = {
  createAppointment,
  checkForConflicts,
  getDoctors,
  getTreatments,
  getRooms,
  searchPatients,
  getDoctorAvailability,
  getAvailableDoctorsForTreatment,
  getAvailableRoomsForTreatment,
  getDoctorAppointments,
  updateAppointmentStatus,
  getAppointments,
  getAvailableSlots
};
