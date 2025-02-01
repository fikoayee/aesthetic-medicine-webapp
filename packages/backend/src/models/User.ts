import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcrypt';

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
  verifyPassword(password: string): Promise<boolean>;
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
    required: true
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Add method to check if user is a doctor
userSchema.methods.isDoctor = function(this: IUser): boolean {
  return this.role === UserRole.DOCTOR;
};

// Add method to verify password
userSchema.methods.verifyPassword = async function(this: IUser, password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
export { UserRole, IUser };
