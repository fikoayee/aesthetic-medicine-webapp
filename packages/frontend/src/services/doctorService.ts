import axiosInstance from './authService';
import { Specialization } from './specializationService';

interface WorkingHours {
  start: string;  // Format: "HH:mm"
  end: string;    // Format: "HH:mm"
}

interface WorkingDay {
  isWorking: boolean;
  hours?: WorkingHours;
}

interface WorkingDayException {
  date: Date;
  isWorking: boolean;
  hours?: WorkingHours;
}

export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specializations: Specialization[];
  phoneNumber: string;
  email: string;
  workingDays: Map<string, WorkingDay>;
  workingDaysExceptions: WorkingDayException[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorFormData {
  firstName: string;
  lastName: string;
  specializations: string[];
  phoneNumber: string;
  email: string;
  workingDays: {
    [key: string]: WorkingDay;
  };
  workingDaysExceptions: WorkingDayException[];
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

const getAllDoctors = async (): Promise<Doctor[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Doctor[]>>('/doctors');
    console.log('Doctor service - Raw API response:', response);
    console.log('Doctor service - Response data:', response.data);
    console.log('Doctor service - Doctors array:', response.data.data);
    return response.data.data || [];
  } catch (error) {
    console.error('Doctor service - Error fetching doctors:', error);
    throw error;
  }
};

const getDoctorById = async (id: string): Promise<Doctor> => {
  const response = await axiosInstance.get<ApiResponse<{ doctor: Doctor }>>(`/doctors/${id}`);
  return response.data.data.doctor;
};

const createDoctor = async (data: DoctorFormData): Promise<Doctor> => {
  const response = await axiosInstance.post<ApiResponse<{ doctor: Doctor }>>('/doctors', data);
  return response.data.data.doctor;
};

const updateDoctor = async (id: string, data: Partial<DoctorFormData>): Promise<Doctor> => {
  const response = await axiosInstance.put<ApiResponse<{ doctor: Doctor }>>(`/doctors/${id}`, data);
  return response.data.data.doctor;
};

const deleteDoctor = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/doctors/${id}`);
};

export const doctorService = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
