import mongoose, { Document } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  specializations: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  specializations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialization',
    required: true
  }]
}, {
  timestamps: true
});

export const Room = mongoose.model<IRoom>('Room', roomSchema);
