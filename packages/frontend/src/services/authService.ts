import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('Using API URL:', API_URL); // Debug log

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/CORS
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface LoginResponse {
  status: string;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      role: string;
      email: string;
    };
  };
}

export const authService = {
  async login(username: string, password: string) {
    try {
      console.log('Attempting login for user:', username); // Debug log
      const response = await axiosInstance.post<LoginResponse>('/auth/login', {
        username,
        password,
      });
      console.log('Login response:', response.data); // Debug log
      
      // Extract the actual data from the nested structure
      return response.data.data;
    } catch (error) {
      console.error('Login error:', error); // Debug log
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data); // Debug log
        console.error('Response status:', error.response?.status); // Debug log
        const errorMessage = error.response?.data?.message || 'Login failed';
        throw new Error(errorMessage);
      }
      throw new Error('Login failed');
    }
  },

  async getCurrentUser() {
    try {
      const response = await axiosInstance.get('/auth/me');
      // The current user endpoint might also have the same structure
      return response.data.data?.user || response.data;
    } catch (error) {
      console.error('Get current user error:', error); // Debug log
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to get current user');
      }
      throw new Error('Failed to get current user');
    }
  },
};

export default axiosInstance;
