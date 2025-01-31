import mongoose, { Document } from 'mongoose';
import bcrypt from 'mongoose-bcrypt';

enum UserRole {
  ADMIN = 'ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
  DOCTOR = 'DOCTOR'
}

interface IUser extends Document {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  role: UserRole;
  doctorId?: mongoose.Types.ObjectId;
  isDoctor(): boolean;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    bcrypt: true
  },
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
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: function(this: IUser) {
      return this.role === UserRole.DOCTOR;
    }
  }
}, {
  timestamps: true
});

// Add bcrypt plugin
userSchema.plugin(bcrypt);

// Add method to check if user is a doctor
userSchema.methods.isDoctor = function(this: IUser): boolean {
  return this.role === UserRole.DOCTOR;
};

export const User = mongoose.model<IUser>('User', userSchema);
export { UserRole, IUser };
