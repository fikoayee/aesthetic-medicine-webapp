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
  }
};
