export enum AppointmentStatus {
  BOOKED = 'booked',
  ONGOING = 'ongoing',
  CANCELED = 'canceled'
}

export enum PaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid'
}

export interface Appointment {
  _id: string;
  doctor: {
    _id: string;
    firstName: string;
    lastName: string;
    specializations: string[];
  };
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    address?: {
      street: string;
      city: string;
      postalCode: string;
    };
  };
  treatment: {
    _id: string;
    name: string;
    duration: number;
    price: number;
    description?: string;
  };
  room: {
    _id: string;
    name: string;
    specializations: string[];
  };
  startTime: string;
  endTime: string;
  price: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentFormData {
  doctorId: string;
  treatmentId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  price: number;
  note?: string;
}
