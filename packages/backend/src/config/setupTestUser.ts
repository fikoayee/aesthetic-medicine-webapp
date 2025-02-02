import { User, UserRole } from '../models/User';
import { connectDB } from './database';
import bcrypt from 'bcrypt';

async function createTestUser() {
  try {
    await connectDB();

    // Check if test user already exists
    const existingUser = await User.findOne({ username: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists');
      process.exit(0);
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    const user = new User({
      username: 'test@example.com',
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '+1234567890',
      role: UserRole.ADMIN
    });

    await user.save();
    console.log('Test user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
