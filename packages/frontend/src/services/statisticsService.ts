import axiosInstance from './authService';

export interface DashboardStatistics {
  monthlyAppointments: number;
  monthlyPatients: number;
  totalDoctors: number;
  avgAppointmentsPerDay: number;
  popularTreatments: Array<{ name: string; count: number }>;
  totalPatients: number;
  avgTreatmentDuration: number;
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

interface DashboardStatisticsResponse {
  statistics: DashboardStatistics;
}

export const statisticsService = {
  getDashboardStatistics: async (): Promise<DashboardStatistics> => {
    try {
      console.log('Making request to /statistics/dashboard');
      const response = await axiosInstance.get<ApiResponse<DashboardStatisticsResponse>>('/statistics/dashboard');
      console.log('Raw API response:', response.data);
      
      if (response.data.status === 'error') {
        console.error('Server returned error status:', response.data.message);
        throw new Error(response.data.message || 'Failed to fetch dashboard statistics');
      }
      
      if (!response.data.data || !response.data.data.statistics) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response format from server');
      }

      const stats = response.data.data.statistics;
      console.log('Parsed statistics:', stats);
      return stats;
    } catch (error: any) {
      console.error('Service error details:', {
        name: error?.name,
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        responseData: error?.response?.data,
        config: {
          url: error?.config?.url,
          method: error?.config?.method,
          headers: error?.config?.headers
        }
      });
      
      // Check if it's an authentication error
      if (error?.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Check if it's a network error
      if (error?.message === 'Network Error') {
        throw new Error('Cannot connect to the server. Please check your connection.');
      }
      
      throw error;
    }
  },
};
