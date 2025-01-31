import axiosInstance from './authService';

export interface Treatment {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

export interface Specialization {
  _id: string;
  name: string;
  description: string;
  treatments?: Treatment[];
}

export interface SpecializationResponse {
  status: string;
  data: {
    specializations: Specialization[];
  };
}

export const specializationService = {
  async getAllSpecializations() {
    const response = await axiosInstance.get<SpecializationResponse>('/specializations');
    return response.data.data.specializations;
  },
};
