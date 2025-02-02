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
  mockAvailableSlots,
  mockAppointments,
  mockSpecializations,
  mockDoctorSpecializations,
  mockRoomSpecializations
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

export interface TimeSlotConflict {
  type: 'doctor' | 'room' | 'patient';
  conflictingAppointment: Appointment;
  message: string;
}

export interface DoctorAvailability {
  doctorId: string;
  availableSlots: {
    startTime: string;
    endTime: string;
  }[];
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

const checkForConflicts = async (
  doctorId: string,
  roomId: string,
  patientId: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): Promise<TimeSlotConflict[]> => {
  if (USE_MOCK_DATA) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const conflicts: TimeSlotConflict[] = [];

    // Filter appointments for the same day
    const dayAppointments = mockAppointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return (
        aptDate.getFullYear() === start.getFullYear() &&
        aptDate.getMonth() === start.getMonth() &&
        aptDate.getDate() === start.getDate() &&
        apt._id !== excludeAppointmentId &&
        apt.status !== AppointmentStatus.CANCELED
      );
    });

    // Check for time conflicts
    dayAppointments.forEach(apt => {
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);

      const hasTimeConflict = (
        (start >= aptStart && start < aptEnd) || // Start time falls within existing appointment
        (end > aptStart && end <= aptEnd) || // End time falls within existing appointment
        (start <= aptStart && end >= aptEnd) // Existing appointment falls within new time slot
      );

      if (hasTimeConflict) {
        if (apt.doctor === doctorId) {
          conflicts.push({
            type: 'doctor',
            conflictingAppointment: apt,
            message: 'Doctor has another appointment at this time'
          });
        }
        if (apt.room === roomId) {
          conflicts.push({
            type: 'room',
            conflictingAppointment: apt,
            message: 'Room is occupied at this time'
          });
        }
        if (apt.patient === patientId) {
          conflicts.push({
            type: 'patient',
            conflictingAppointment: apt,
            message: 'Patient has another appointment at this time'
          });
        }
      }
    });

    return conflicts;
  }

  const response = await axiosInstance.get<ApiResponse<TimeSlotConflict[]>>('/appointments/check-conflicts', {
    params: {
      doctorId,
      roomId,
      patientId,
      startTime,
      endTime,
      excludeAppointmentId
    }
  });
  return response.data.data;
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

const getDoctorAvailability = async (date: string): Promise<DoctorAvailability[]> => {
  if (USE_MOCK_DATA) {
    // Convert date to start and end of day
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // Get all appointments for the selected date
    const dayAppointments = mockAppointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return (
        aptDate >= startOfDay &&
        aptDate <= endOfDay &&
        apt.status !== AppointmentStatus.CANCELED
      );
    });

    // Create availability slots for each doctor
    return mockDoctors.map(doctor => {
      // Get doctor's appointments for the day
      const doctorAppointments = dayAppointments
        .filter(apt => apt.doctor === doctor._id)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      // Default working hours (9 AM to 5 PM)
      const workStart = new Date(selectedDate.setHours(9, 0, 0, 0));
      const workEnd = new Date(selectedDate.setHours(17, 0, 0, 0));

      // Generate available slots
      const availableSlots: { startTime: string; endTime: string }[] = [];
      let currentTime = new Date(workStart);

      // If no appointments, entire work day is available
      if (doctorAppointments.length === 0) {
        availableSlots.push({
          startTime: workStart.toISOString(),
          endTime: workEnd.toISOString()
        });
      } else {
        // Add slots between appointments
        doctorAppointments.forEach((apt, index) => {
          const aptStart = new Date(apt.startTime);
          
          // Add slot before appointment if there's time
          if (currentTime < aptStart) {
            availableSlots.push({
              startTime: currentTime.toISOString(),
              endTime: aptStart.toISOString()
            });
          }
          
          // Move current time to end of this appointment
          currentTime = new Date(apt.endTime);

          // If this is the last appointment and there's time after it
          if (index === doctorAppointments.length - 1 && currentTime < workEnd) {
            availableSlots.push({
              startTime: currentTime.toISOString(),
              endTime: workEnd.toISOString()
            });
          }
        });
      }

      return {
        doctorId: doctor._id,
        availableSlots
      };
    });
  }

  const response = await axiosInstance.get<ApiResponse<DoctorAvailability[]>>('/doctors/availability', {
    params: { date }
  });
  return response.data.data;
};

const getAvailableDoctorsForTreatment = async (treatmentId: string): Promise<Doctor[]> => {
  if (USE_MOCK_DATA) {
    const treatment = mockTreatments.find(t => t._id === treatmentId);
    if (!treatment) return [];

    // Get specialization for this treatment
    const specialization = mockSpecializations.find(s => s._id === treatment.specializationId);
    if (!specialization) return [];

    // Get doctors who have this specialization
    const doctorsWithSpecialization = mockDoctorSpecializations
      .filter(ds => ds.specializationIds.includes(specialization._id))
      .map(ds => ds.doctorId);

    return mockDoctors.filter(d => doctorsWithSpecialization.includes(d._id));
  }

  const response = await axiosInstance.get<ApiResponse<Doctor[]>>('/doctors/available', {
    params: { treatmentId }
  });
  return response.data.data;
};

const getAvailableRoomsForTreatment = async (treatmentId: string): Promise<Room[]> => {
  if (USE_MOCK_DATA) {
    const treatment = mockTreatments.find(t => t._id === treatmentId);
    if (!treatment) return [];

    // Get specialization for this treatment
    const specialization = mockSpecializations.find(s => s._id === treatment.specializationId);
    if (!specialization) return [];

    // Get rooms that have this specialization
    const roomsWithSpecialization = mockRoomSpecializations
      .filter(rs => rs.specializationIds.includes(specialization._id))
      .map(rs => rs.roomId);

    return mockRooms.filter(r => roomsWithSpecialization.includes(r._id));
  }

  const response = await axiosInstance.get<ApiResponse<Room[]>>('/rooms/available', {
    params: { treatmentId }
  });
  return response.data.data;
};

export const appointmentService = {
  createAppointment,
  getDoctors,
  getTreatments,
  getRooms,
  searchPatients,
  getAvailableSlots,
  checkForConflicts,
  getDoctorAvailability,
  getAvailableDoctorsForTreatment,
  getAvailableRoomsForTreatment
};
