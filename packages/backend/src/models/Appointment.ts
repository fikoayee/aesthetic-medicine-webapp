import mongoose from 'mongoose';

enum AppointmentStatus {
  BOOKED = 'booked',
  ONGOING = 'ongoing',
  CANCELED = 'canceled'
}

enum PaymentStatus {
PAID = 'paid',
UNPAID = 'unpaid'
}

const appointmentSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  treatment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatment',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(AppointmentStatus),
    default: AppointmentStatus.BOOKED
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.UNPAID
  },
  note: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Add validation to ensure endTime is after startTime
appointmentSchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    next(new Error('End time must be after start time'));
  }
  next();
});

// Add indexes for efficient querying
appointmentSchema.index({ doctor: 1, startTime: 1 });
appointmentSchema.index({ patient: 1, startTime: 1 });
appointmentSchema.index({ room: 1, startTime: 1 });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
export { AppointmentStatus, PaymentStatus };
