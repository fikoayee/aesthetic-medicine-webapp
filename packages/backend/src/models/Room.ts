import mongoose, { Schema, Document } from 'mongoose';
import { ISpecialization } from './Specialization';

export interface IRoom extends Document {
  name: string;
  description: string;
  specializations: mongoose.Types.ObjectId[] | ISpecialization[];
}

const roomSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  specializations: [{
    type: Schema.Types.ObjectId,
    ref: 'Specialization'
  }]
}, {
  timestamps: true
});

export const Room = mongoose.model<IRoom>('Room', roomSchema);
