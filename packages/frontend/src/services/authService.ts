import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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
      const response = await axiosInstance.post<LoginResponse>('/auth/login', {
        username,
        password,
      });
      
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Login failed';
        throw new Error(errorMessage);
      }
      throw new Error('Login failed');
    }
  },

  async getCurrentUser() {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }

      const response = await axiosInstance.get('/auth/me');
      const user = response.data.data?.user || response.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to get current user');
      }
      throw new Error('Failed to get current user');
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

export default axiosInstance;
