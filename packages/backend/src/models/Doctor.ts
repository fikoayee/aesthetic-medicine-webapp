import mongoose from 'mongoose';

const workingDayExceptionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  isWorking: {
    type: Boolean,
    required: true
  },
  customHours: {
    start: Date,
    end: Date
  }
});

const doctorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  specializations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialization',
    required: true
  }],
  workingDays: {
    type: Map,
    of: {
      isWorking: Boolean,
      hours: {
        start: String, // Format: "HH:mm"
        end: String    // Format: "HH:mm"
      }
    },
    required: true,
    default: {
      'monday': { isWorking: true, hours: { start: '09:00', end: '17:00' } },
      'tuesday': { isWorking: true, hours: { start: '09:00', end: '17:00' } },
      'wednesday': { isWorking: true, hours: { start: '09:00', end: '17:00' } },
      'thursday': { isWorking: true, hours: { start: '09:00', end: '17:00' } },
      'friday': { isWorking: true, hours: { start: '09:00', end: '17:00' } },
      'saturday': { isWorking: false },
      'sunday': { isWorking: false }
    }
  },
  workingDaysExceptions: [workingDayExceptionSchema]
}, {
  timestamps: true
});

export const Doctor = mongoose.model('Doctor', doctorSchema);
