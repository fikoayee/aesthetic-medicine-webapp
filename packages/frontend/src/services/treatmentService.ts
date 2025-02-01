import axiosInstance from './authService';
import { Specialization } from './specializationService';

export interface Treatment {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  specialization: Specialization;
}

export interface CreateTreatmentData {
  name: string;
  description: string;
  duration: number;
  price: number;
  specialization: string; // specialization ID
}

export interface TreatmentResponse {
  status: string;
  data: {
    treatments: Treatment[];
  };
}

export interface SingleTreatmentResponse {
  status: string;
  data: {
    treatment: Treatment;
  };
}

export const treatmentService = {
  async getAllTreatments() {
    const response = await axiosInstance.get<TreatmentResponse>('/treatments');
    return response.data.data.treatments;
  },

  async getTreatmentById(id: string) {
    const response = await axiosInstance.get<SingleTreatmentResponse>(`/treatments/${id}`);
    return response.data.data.treatment;
  },

  async createTreatment(treatmentData: CreateTreatmentData) {
    const response = await axiosInstance.post<SingleTreatmentResponse>('/treatments', treatmentData);
    return response.data.data.treatment;
  },

  async updateTreatment(id: string, treatmentData: Partial<CreateTreatmentData>) {
    const response = await axiosInstance.put<SingleTreatmentResponse>(`/treatments/${id}`, treatmentData);
    return response.data.data.treatment;
  },

  async deleteTreatment(id: string) {
    await axiosInstance.delete(`/treatments/${id}`);
  }
};
