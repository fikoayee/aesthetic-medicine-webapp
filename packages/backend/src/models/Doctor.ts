import { Schema, model, Document, Types } from 'mongoose';
import { ISpecialization } from './Specialization';

interface WorkingHours {
  start: string;
  end: string;
}

interface WorkingDay {
  isWorking: boolean;
  hours?: WorkingHours;
}

interface WorkingDayException {
  date: Date;
  isWorking: boolean;
  hours?: WorkingHours;
}

// Interface for the document in MongoDB
export interface IDoctor extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  specializations: Types.ObjectId[] | ISpecialization[];
  workingDays: Map<string, WorkingDay>;
  workingDaysExceptions?: WorkingDayException[];
  createdAt: Date;
  updatedAt: Date;
}

// Interface for lean documents (plain objects)
export interface IDoctorLean {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  specializations: Types.ObjectId[] | ISpecialization[];
  workingDays: Record<string, WorkingDay>;
  workingDaysExceptions?: WorkingDayException[];
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    specializations: [{
      type: Schema.Types.ObjectId,
      ref: 'Specialization',
      required: true,
    }],
    workingDays: {
      type: Map,
      of: {
        isWorking: Boolean,
        hours: {
          start: String,
          end: String,
        },
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
    workingDaysExceptions: [{
      date: {
        type: Date,
        required: true,
      },
      isWorking: {
        type: Boolean,
        required: true,
      },
      hours: {
        start: String,
        end: String,
      },
    }],
  },
  {
    timestamps: true,
  }
);

export const Doctor = model<IDoctor>('Doctor', doctorSchema);
