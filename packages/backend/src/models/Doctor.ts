import mongoose, { Document } from 'mongoose';

interface IWorkingHours {
  start: string;  // Format: "HH:mm"
  end: string;    // Format: "HH:mm"
}

interface IWorkingDay {
  isWorking: boolean;
  hours?: IWorkingHours;
}

interface IWorkingDayException {
  date: Date;
  isWorking: boolean;
  hours?: IWorkingHours;
}

export interface IDoctor extends Document {
  firstName: string;
  lastName: string;
  specializations: mongoose.Types.ObjectId[];
  phoneNumber: string;
  email: string;
  workingDays: Map<string, IWorkingDay>;
  workingDaysExceptions: IWorkingDayException[];
  createdAt: Date;
  updatedAt: Date;
}

const workingDayExceptionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  isWorking: {
    type: Boolean,
    required: true
  },
  hours: {
    start: String,
    end: String
  }
}, { _id: false });

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
  specializations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialization',
    required: true
  }],
  phoneNumber: {
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
  workingDays: {
    type: Map,
    of: {
      isWorking: Boolean,
      hours: {
        start: String,
        end: String
      }
    },
    required: true,
    default: new Map([
      ['monday', { isWorking: true, hours: { start: '09:00', end: '17:00' } }],
      ['tuesday', { isWorking: true, hours: { start: '09:00', end: '17:00' } }],
      ['wednesday', { isWorking: true, hours: { start: '09:00', end: '17:00' } }],
      ['thursday', { isWorking: true, hours: { start: '09:00', end: '17:00' } }],
      ['friday', { isWorking: true, hours: { start: '09:00', end: '17:00' } }],
      ['saturday', { isWorking: false }],
      ['sunday', { isWorking: false }]
    ])
  },
  workingDaysExceptions: [workingDayExceptionSchema]
}, {
  timestamps: true
});

export const Doctor = mongoose.model<IDoctor>('Doctor', doctorSchema);
