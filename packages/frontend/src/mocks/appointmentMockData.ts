import { Types } from 'mongoose';
import { Gender } from '@/types/patient';
import { AppointmentStatus, PaymentStatus } from '@/types/appointment';

// Helper function to create MongoDB ObjectId
const createObjectId = () => new Types.ObjectId().toString();

// Specializations
export const mockSpecializations = [
  {
    _id: createObjectId(),
    name: 'Dermatology',
    description: 'Skin treatments and procedures',
    treatments: [], // Will be filled after treatments are defined
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    _id: createObjectId(),
    name: 'Aesthetic Medicine',
    description: 'Cosmetic and aesthetic procedures',
    treatments: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Treatments
export const mockTreatments = [
  {
    _id: createObjectId(),
    name: 'Botox Injection',
    description: 'Wrinkle reduction treatment',
    duration: 30, // minutes
    price: 300,
    specialization: mockSpecializations[1]._id,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    _id: createObjectId(),
    name: 'Dermal Fillers',
    description: 'Volume enhancement treatment',
    duration: 45,
    price: 450,
    specialization: mockSpecializations[1]._id,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    _id: createObjectId(),
    name: 'Acne Treatment',
    description: 'Advanced acne therapy',
    duration: 60,
    price: 200,
    specialization: mockSpecializations[0]._id,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Update specializations with treatments
mockSpecializations[0].treatments = [mockTreatments[2]._id];
mockSpecializations[1].treatments = [mockTreatments[0]._id, mockTreatments[1]._id];

// Rooms
export const mockRooms = [
  {
    _id: createObjectId(),
    name: 'Room 101',
    description: 'Main treatment room',
    specializations: [mockSpecializations[0]._id, mockSpecializations[1]._id],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    _id: createObjectId(),
    name: 'Room 102',
    description: 'Aesthetic procedures room',
    specializations: [mockSpecializations[1]._id],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Doctors with working hours
export const mockDoctors = [
  {
    _id: createObjectId(),
    firstName: 'John',
    lastName: 'Smith',
    specializations: [mockSpecializations[0]._id, mockSpecializations[1]._id],
    phoneNumber: '+1234567890',
    email: 'john.smith@clinic.com',
    workingDays: new Map([
      ['monday', { isWorking: true, hours: { start: '09:00', end: '17:00' } }],
      ['tuesday', { isWorking: true, hours: { start: '09:00', end: '17:00' } }],
      ['wednesday', { isWorking: true, hours: { start: '09:00', end: '17:00' } }],
      ['thursday', { isWorking: true, hours: { start: '09:00', end: '17:00' } }],
      ['friday', { isWorking: true, hours: { start: '09:00', end: '15:00' } }],
      ['saturday', { isWorking: false }],
      ['sunday', { isWorking: false }]
    ]),
    workingDaysExceptions: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    _id: createObjectId(),
    firstName: 'Sarah',
    lastName: 'Johnson',
    specializations: [mockSpecializations[1]._id],
    phoneNumber: '+1234567891',
    email: 'sarah.johnson@clinic.com',
    workingDays: new Map([
      ['monday', { isWorking: true, hours: { start: '10:00', end: '18:00' } }],
      ['tuesday', { isWorking: true, hours: { start: '10:00', end: '18:00' } }],
      ['wednesday', { isWorking: true, hours: { start: '10:00', end: '18:00' } }],
      ['thursday', { isWorking: true, hours: { start: '10:00', end: '18:00' } }],
      ['friday', { isWorking: true, hours: { start: '10:00', end: '16:00' } }],
      ['saturday', { isWorking: false }],
      ['sunday', { isWorking: false }]
    ]),
    workingDaysExceptions: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Patients
export const mockPatients = [
  {
    _id: createObjectId(),
    firstName: 'Alice',
    lastName: 'Brown',
    email: 'alice.brown@email.com',
    phoneNumber: '+1234567890',
    birthDate: new Date('1990-05-15').toISOString(),
    gender: Gender.FEMALE,
    address: {
      street: '123 Main St',
      city: 'New York',
      postalCode: '10001'
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString()
  },
  {
    _id: createObjectId(),
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@email.com',
    phoneNumber: '+1987654321',
    birthDate: new Date('1985-08-20').toISOString(),
    gender: Gender.MALE,
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      postalCode: '90001'
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString()
  },
  {
    _id: createObjectId(),
    firstName: 'Carol',
    lastName: 'Johnson',
    email: 'carol.j@email.com',
    phoneNumber: '+1122334455',
    birthDate: new Date('1995-03-10').toISOString(),
    gender: Gender.FEMALE,
    address: {
      street: '789 Pine St',
      city: 'Chicago',
      postalCode: '60601'
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString()
  }
];

// Sample appointments
export const mockAppointments = [
  {
    _id: createObjectId(),
    doctor: mockDoctors[0]._id,
    patient: mockPatients[0]._id,
    treatment: mockTreatments[0]._id,
    room: mockRooms[0]._id,
    startTime: new Date('2024-02-05T10:00:00Z'),
    endTime: new Date('2024-02-05T10:30:00Z'),
    price: mockTreatments[0].price,
    status: AppointmentStatus.BOOKED,
    paymentStatus: PaymentStatus.UNPAID,
    note: 'First time patient',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Available time slots for the next week
export const mockAvailableSlots = [
  {
    startTime: new Date('2024-02-05T09:00:00Z'),
    endTime: new Date('2024-02-05T09:30:00Z'),
    roomId: mockRooms[0]._id
  },
  {
    startTime: new Date('2024-02-05T09:30:00Z'),
    endTime: new Date('2024-02-05T10:00:00Z'),
    roomId: mockRooms[0]._id
  },
  {
    startTime: new Date('2024-02-05T10:30:00Z'),
    endTime: new Date('2024-02-05T11:00:00Z'),
    roomId: mockRooms[1]._id
  }
];
