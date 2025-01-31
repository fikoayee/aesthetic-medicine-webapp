import mongoose, { Document } from 'mongoose';

export interface ISpecialization extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const specializationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

export const Specialization = mongoose.model<ISpecialization>('Specialization', specializationSchema);
