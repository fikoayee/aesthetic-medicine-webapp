import mongoose, { Schema, Document } from 'mongoose';

export interface ITreatment extends Document {
  name: string;
  description: string;
  duration: number;
  price: number;
}

const treatmentSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  }
}, {
  timestamps: true
});

export const Treatment = mongoose.model<ITreatment>('Treatment', treatmentSchema);
