import axiosInstance from './authService';

interface Treatment {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

interface Specialization {
  _id: string;
  name: string;
  description: string;
  treatments: Treatment[];
}

export interface Room {
  _id: string;
  name: string;
  description: string;
  specializations: Specialization[];
}

export interface RoomResponse {
  status: string;
  data: {
    rooms: Room[];
  };
}

export interface SingleRoomResponse {
  status: string;
  data: {
    room: Room;
  };
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const roomService = {
  async getAllRooms() {
    const response = await axiosInstance.get<RoomResponse>('/rooms');
    return response.data.data.rooms;
  },

  async getRoomById(id: string) {
    const response = await axiosInstance.get<SingleRoomResponse>(`/rooms/${id}`);
    return response.data.data.room;
  },

  async createRoom(roomData: Omit<Room, '_id'>) {
    const response = await axiosInstance.post<SingleRoomResponse>('/rooms', roomData);
    return response.data.data.room;
  },

  async updateRoom(id: string, roomData: Partial<Room>) {
    const response = await axiosInstance.put<SingleRoomResponse>(`/rooms/${id}`, roomData);
    return response.data.data.room;
  },

  async deleteRoom(id: string) {
    await axiosInstance.delete(`/rooms/${id}`);
  },

  async getRoomSpecializations(roomId: string) {
    try {
      const response = await axiosInstance.get<ApiResponse<{ specializations: Specialization[] }>>(`/rooms/${roomId}/specializations`);
      if (response.data.status !== 'success') {
        throw new Error(response.data.message);
      }
      return response.data.data.specializations;
    } catch (error) {
      console.error('Error in getRoomSpecializations:', error);
      throw error;
    }
  },
};
