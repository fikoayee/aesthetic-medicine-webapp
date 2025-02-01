import mongoose, { Schema, Document, Types } from 'mongoose';
import { ISpecialization } from './Specialization';

export interface ITreatment extends Document {
  name: string;
  description: string;
  duration: number;
  price: number;
  specialization: Types.ObjectId;
  _id: Types.ObjectId;
}

const TreatmentSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Treatment name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Treatment description is required'],
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'Treatment duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
  },
  price: {
    type: Number,
    required: [true, 'Treatment price is required'],
    min: [0, 'Price cannot be negative'],
  },
  specialization: {
    type: Schema.Types.ObjectId,
    ref: 'Specialization',
    required: [true, 'Treatment must belong to a specialization'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const Treatment = mongoose.model<ITreatment>('Treatment', TreatmentSchema);
