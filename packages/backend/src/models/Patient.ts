import mongoose, { Document } from 'mongoose';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NOT_SPECIFIED = 'not_specified'
}

interface IAddress {
  street: string;
  city: string;
  postalCode: string;
}

export interface IPatient extends Document {
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: Gender;
  address: IAddress;
  phoneNumber: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new mongoose.Schema({
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
  birthDate: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: Object.values(Gender),
    default: Gender.NOT_SPECIFIED
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    }
  },
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
  }
}, {
  timestamps: true
});

export const Patient = mongoose.model<IPatient>('Patient', patientSchema);
