import axiosInstance from './authService';
import { Doctor } from './doctorService';
import { Treatment } from './treatmentService';
import { Room } from './roomService';
import { Patient } from '../types/patient';
import { AppointmentStatus, PaymentStatus, Appointment, AppointmentFormData } from '../types/appointment';
import {
  mockDoctors,
  mockTreatments,
  mockRooms,
  mockPatients,
  mockAvailableSlots
} from '../mocks/appointmentMockData';

export { AppointmentStatus, PaymentStatus } from '../types/appointment';

export interface NewPatientData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  gender: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
}

export interface CreateAppointmentData {
  patientId?: string;
  newPatient?: NewPatientData;
  appointment: AppointmentFormData;
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

//set to true to use mock data
const USE_MOCK_DATA = true;

const createAppointment = async (data: CreateAppointmentData): Promise<Appointment> => {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a mock appointment
    const mockAppointment: Appointment = {
      _id: new Date().getTime().toString(),
      doctor: mockDoctors.find(d => d._id === data.appointment.doctorId)!,
      patient: data.patientId 
        ? mockPatients.find(p => p._id === data.patientId)!
        : { ...data.newPatient!, _id: new Date().getTime().toString() } as Patient,
      treatment: mockTreatments.find(t => t._id === data.appointment.treatmentId)!,
      room: mockRooms.find(r => r._id === data.appointment.roomId)!,
      startTime: data.appointment.startTime,
      endTime: data.appointment.endTime,
      price: data.appointment.price,
      status: AppointmentStatus.BOOKED,
      paymentStatus: PaymentStatus.UNPAID,
      note: data.appointment.note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return Promise.resolve(mockAppointment);
  }
  try {
    // If we have a new patient, create them first
    let patientId = data.patientId;
    
    if (!patientId && data.newPatient) {
      const patientResponse = await axiosInstance.post<ApiResponse<{ patient: Patient }>>('/patients', data.newPatient);
      patientId = patientResponse.data.data.patient._id;
    }

    // Create the appointment
    const appointmentData = {
      ...data.appointment,
      patientId,
      status: AppointmentStatus.BOOKED,
      paymentStatus: PaymentStatus.UNPAID
    };

    const response = await axiosInstance.post<ApiResponse<{ appointment: Appointment }>>('/appointments', appointmentData);
    return response.data.data.appointment;
  } catch (error) {
    throw error;
  }
};

const getDoctors = async (): Promise<Doctor[]> => {
  if (USE_MOCK_DATA) {
    console.log('Getting mock doctors');
    return Promise.resolve(mockDoctors);
  }
  console.log('Getting doctors from API');
  const response = await axiosInstance.get<ApiResponse<{ doctors: Doctor[] }>>('/doctors');
  console.log('Received doctors from API:', response.data.data.doctors);
  return response.data.data.doctors;
};

const getTreatments = async (): Promise<Treatment[]> => {
  if (USE_MOCK_DATA) {
    console.log('Getting mock treatments');
    return Promise.resolve(mockTreatments);
  }
  console.log('Getting treatments from API');
  const response = await axiosInstance.get<ApiResponse<{ treatments: Treatment[] }>>('/treatments');
  console.log('Received treatments from API:', response.data.data.treatments);
  return response.data.data.treatments;
};

const getRooms = async (): Promise<Room[]> => {
  if (USE_MOCK_DATA) {
    console.log('Getting mock rooms');
    return Promise.resolve(mockRooms);
  }
  console.log('Getting rooms from API');
  const response = await axiosInstance.get<ApiResponse<{ rooms: Room[] }>>('/rooms');
  console.log('Received rooms from API:', response.data.data.rooms);
  return response.data.data.rooms;
};

const searchPatients = async (query: string): Promise<Patient[]> => {
  if (USE_MOCK_DATA) {
    console.log('Searching patients with query:', query);
    console.log('Available mock patients:', mockPatients);
    
    // Add a small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const lowerQuery = query.toLowerCase();
    const results = mockPatients.filter(
      patient =>
        patient.firstName.toLowerCase().includes(lowerQuery) ||
        patient.lastName.toLowerCase().includes(lowerQuery) ||
        patient.email.toLowerCase().includes(lowerQuery) ||
        patient.phoneNumber.includes(query)
    );
    
    console.log('Search results:', results);
    return Promise.resolve(results);
  }
  console.log('Searching patients with query:', query);
  const response = await axiosInstance.get<ApiResponse<Patient[]>>('/patients/search', {
    params: { query }
  });
  console.log('Received search results from API:', response.data.data);
  return response.data.data;
};

const getAvailableSlots = async (doctorId: string, date: string): Promise<{ startTime: string; endTime: string; roomId: string; }[]> => {
  if (USE_MOCK_DATA) {
    console.log('Getting available slots for doctor:', doctorId, 'on date:', date);
    // Filter slots for the given date
    const requestDate = new Date(date);
    const results = mockAvailableSlots
      .filter(slot => {
        const slotDate = new Date(slot.startTime);
        return (
          slotDate.getFullYear() === requestDate.getFullYear() &&
          slotDate.getMonth() === requestDate.getMonth() &&
          slotDate.getDate() === requestDate.getDate()
        );
      })
      .map(slot => ({
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        roomId: slot.roomId
      }));
    
    console.log('Available slots:', results);
    return Promise.resolve(results);
  }
  console.log('Getting available slots for doctor:', doctorId, 'on date:', date);
  const response = await axiosInstance.get<ApiResponse<{ slots: { startTime: string; endTime: string; roomId: string; }[] }>>('/appointments/available-slots', {
    params: {
      doctorId,
      date
    }
  });
  console.log('Received available slots from API:', response.data.data.slots);
  return response.data.data.slots;
};

export const appointmentService = {
  createAppointment,
  getDoctors,
  getTreatments,
  getRooms,
  searchPatients,
  getAvailableSlots,
};
