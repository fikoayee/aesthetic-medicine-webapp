import axiosInstance from './authService';
import { Treatment } from './treatmentService';

export interface Specialization {
  _id: string;
  name: string;
  description: string;
  treatments: Treatment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSpecializationDto {
  name: string;
  description: string;
}

export interface UpdateSpecializationDto {
  name?: string;
  description?: string;
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

interface SpecializationsResponse {
  specializations: Specialization[];
}

interface SpecializationResponse {
  specialization: Specialization;
}

export const specializationService = {
  async getAllSpecializations(): Promise<Specialization[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<SpecializationsResponse>>('/specializations');
      console.log('Raw specializations response:', response.data);
      if (response.data.status !== 'success') {
        throw new Error(response.data.message);
      }
      return response.data.data.specializations;
    } catch (error) {
      console.error('Error in getAllSpecializations:', error);
      throw error;
    }
  },

  async getSpecializationById(id: string): Promise<Specialization> {
    try {
      const response = await axiosInstance.get<ApiResponse<SpecializationResponse>>(`/specializations/${id}`);
      if (response.data.status !== 'success') {
        throw new Error(response.data.message);
      }
      return response.data.data.specialization;
    } catch (error) {
      console.error('Error in getSpecializationById:', error);
      throw error;
    }
  },

  async createSpecialization(data: CreateSpecializationDto): Promise<Specialization> {
    try {
      console.log('Creating specialization with data:', data);
      const response = await axiosInstance.post<ApiResponse<SpecializationResponse>>('/specializations', data);
      if (response.data.status !== 'success') {
        throw new Error(response.data.message);
      }
      console.log('Create specialization response:', response.data);
      return response.data.data.specialization;
    } catch (error) {
      console.error('Error in createSpecialization:', error);
      throw error;
    }
  },

  async updateSpecialization(id: string, data: UpdateSpecializationDto): Promise<Specialization> {
    try {
      console.log('Updating specialization with data:', { id, data });
      const response = await axiosInstance.put<ApiResponse<SpecializationResponse>>(`/specializations/${id}`, data);
      if (response.data.status !== 'success') {
        throw new Error(response.data.message);
      }
      console.log('Update specialization response:', response.data);
      return response.data.data.specialization;
    } catch (error) {
      console.error('Error in updateSpecialization:', error);
      throw error;
    }
  },

  async deleteSpecialization(id: string): Promise<void> {
    try {
      const response = await axiosInstance.delete<ApiResponse<{}>>(`/specializations/${id}`);
      if (response.data.status !== 'success') {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error in deleteSpecialization:', error);
      throw error;
    }
  },

  async transferTreatments(fromSpecializationId: string, toSpecializationId: string, treatmentIds: string[]): Promise<Specialization[]> {
    try {
      const response = await axiosInstance.post<ApiResponse<{ specializations: Specialization[] }>>('/specializations/transfer-treatments', {
        fromSpecializationId,
        toSpecializationId,
        treatmentIds
      });
      
      if (response.data.status !== 'success') {
        throw new Error(response.data.message);
      }
      
      return response.data.data.specializations;
    } catch (error) {
      console.error('Error in transferTreatments:', error);
      throw error;
    }
  }
};
