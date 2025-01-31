import mongoose, { Schema, Document } from 'mongoose';
import { ITreatment } from './Treatment';

export interface ISpecialization extends Document {
  name: string;
  description: string;
  treatments: mongoose.Types.ObjectId[] | ITreatment[];
  createdAt: Date;
  updatedAt: Date;
}

const specializationSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  treatments: [{
    type: Schema.Types.ObjectId,
    ref: 'Treatment'
  }]
}, {
  timestamps: true
});

export const Specialization = mongoose.model<ISpecialization>('Specialization', specializationSchema);
