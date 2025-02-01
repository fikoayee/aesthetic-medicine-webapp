import axiosInstance from './authService';
import { Patient } from '../types/patient';

interface ApiResponse<T> {
  status: string;
  data: T;
}

interface TreatmentHistory {
  _id: string;
  date: string;
  treatmentName: string;
  description: string;
  type: string;
  cost: number;
  doctor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

const getAllPatients = async (): Promise<Patient[]> => {
  const response = await axiosInstance.get<ApiResponse<{ patients: Patient[] }>>('/patients');
  return response.data.data.patients;
};

const getPatientById = async (id: string): Promise<Patient> => {
  const response = await axiosInstance.get<ApiResponse<{ patient: Patient }>>(`/patients/${id}`);
  return response.data.data.patient;
};

const getTreatmentHistory = async (patientId: string): Promise<TreatmentHistory[]> => {
  const response = await axiosInstance.get<ApiResponse<{ appointments: TreatmentHistory[] }>>(
    `/appointments?patientId=${patientId}`
  );
  return response.data.data.appointments;
};

const createPatient = async (patientData: Omit<Patient, '_id'>): Promise<Patient> => {
  try {
    const response = await axiosInstance.post<ApiResponse<{ patient: Patient }>>('/patients', patientData);
    return response.data.data.patient;
  } catch (error) {
    console.error('Create patient error:', error);
    throw error;
  }
};

const updatePatient = async (id: string, patientData: Partial<Omit<Patient, '_id'>>): Promise<Patient> => {
  const response = await axiosInstance.put<ApiResponse<{ patient: Patient }>>(`/patients/${id}`, patientData);
  return response.data.data.patient;
};

const deletePatient = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/patients/${id}`);
};

export const patientService = {
  getAllPatients,
  getPatientById,
  getTreatmentHistory,
  createPatient,
  updatePatient,
  deletePatient,
};
