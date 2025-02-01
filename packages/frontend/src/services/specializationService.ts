import axiosInstance from './authService';
import { Treatment } from './treatmentService';

export interface Specialization {
  _id: string;
  name: string;
  description: string;
  treatments: Treatment[];
}

export interface SpecializationResponse {
  status: string;
  data: {
    specializations: Specialization[];
  };
}

export interface SingleSpecializationResponse {
  status: string;
  data: {
    specialization: Specialization;
  };
}

export const specializationService = {
  async getAllSpecializations() {
    const response = await axiosInstance.get<SpecializationResponse>('/specializations');
    return response.data.data.specializations;
  },

  async getSpecializationById(id: string) {
    const response = await axiosInstance.get<SingleSpecializationResponse>(`/specializations/${id}`);
    return response.data.data.specialization;
  }
};
