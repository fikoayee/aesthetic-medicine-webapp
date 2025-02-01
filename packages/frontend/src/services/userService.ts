import axiosInstance from './authService';

interface UpdateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface DoctorSpecialization {
  _id: string;
  name: string;
}

interface UserProfileResponse {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username: string;
  role: string;
  doctorId?: string;
  doctor?: {
    specializations: DoctorSpecialization[];
  };
}

class UserService {
  static async getUserProfile(userId: string): Promise<UserProfileResponse> {
    const response = await axiosInstance.get(`/users/${userId}/profile`);
    return response.data.data.user;
  }

  static async updateUserProfile(userId: string, userData: UpdateUserData): Promise<UserProfileResponse> {
    const response = await axiosInstance.put(`/users/${userId}`, userData);
    return response.data.data.user;
  }

  static async changePassword(userId: string, passwordData: ChangePasswordData): Promise<void> {
    await axiosInstance.post('/auth/change-password', passwordData);
  }
}

export default UserService;
