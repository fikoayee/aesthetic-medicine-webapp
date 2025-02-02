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
  doctor: string;
  patient: string;
  treatment: string;
  room: string;
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
