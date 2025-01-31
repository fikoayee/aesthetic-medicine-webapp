import mongoose, { Document } from 'mongoose';

export interface ITreatment extends Document {
  name: string;
  description: string;
  duration: number;
  price: number;
  specialization: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const treatmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  specialization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialization',
    required: true
  }
}, {
  timestamps: true
});

export const Treatment = mongoose.model<ITreatment>('Treatment', treatmentSchema);
