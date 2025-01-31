import mongoose from 'mongoose';

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

export const Room = mongoose.model('Room', roomSchema);
