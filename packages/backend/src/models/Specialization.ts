import mongoose from 'mongoose';

const specializationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

export const Specialization = mongoose.model('Specialization', specializationSchema);
