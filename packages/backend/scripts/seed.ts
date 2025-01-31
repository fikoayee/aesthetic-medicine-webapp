import mongoose from 'mongoose';
import { User, UserRole } from '../src/models/User';
import { Doctor } from '../src/models/Doctor';
import { Patient, Gender } from '../src/models/Patient';
import { Treatment } from '../src/models/Treatment';
import { Room } from '../src/models/Room';
import { Appointment, AppointmentStatus, PaymentStatus } from '../src/models/Appointment';
import { Specialization } from '../src/models/Specialization';
import bcrypt from 'bcrypt';

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aesthetic-clinic');
    
    // Clear existing data
    await mongoose?.connection?.db?.dropDatabase();

    // Create specializations first
    const dermatology = await Specialization.create({
      name: 'Dermatology',
      description: 'Diagnosis and treatment of skin conditions'
    });

    const cosmeticSurgery = await Specialization.create({
      name: 'Cosmetic Surgery',
      description: 'Surgical procedures to enhance appearance'
    });

    // Create users
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedReceptionistPassword = await bcrypt.hash('receptionist123', 10);

    const admin = await User.create({
      username: 'admin',
      email: 'admin@clinic.com',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+48123456788',
      role: UserRole.ADMIN
    });

    const receptionist = await User.create({
      username: 'receptionist',
      email: 'receptionist@clinic.com',
      password: hashedReceptionistPassword,
      firstName: 'Reception',
      lastName: 'Staff',
      phoneNumber: '+48123456787',
      role: UserRole.RECEPTIONIST
    });

    // Create doctors
    const doctor1 = await Doctor.create({
      firstName: 'John',
      lastName: 'Doe',
      specializations: [dermatology._id],
      phoneNumber: '+48123456789',
      email: 'johndoe@clinic.com',
      workingDays: new Map([
        ['monday', { isWorking: true, hours: { start: '09:00', end: '17:00' } }],
        ['tuesday', { isWorking: true, hours: { start: '09:00', end: '17:00' } }],
        ['wednesday', { isWorking: true, hours: { start: '09:00', end: '17:00' } }],
        ['thursday', { isWorking: true, hours: { start: '09:00', end: '17:00' } }],
        ['friday', { isWorking: true, hours: { start: '09:00', end: '15:00' } }],
        ['saturday', { isWorking: false }],
        ['sunday', { isWorking: false }]
      ])
    });

    // Create doctor user account
    const hashedDoctorPassword = await bcrypt.hash('doctor123', 10);
    const doctorUser1 = await User.create({
      username: 'johndoe',
      email: 'johndoe@clinic.com',
      password: hashedDoctorPassword,
      firstName: doctor1.firstName,
      lastName: doctor1.lastName,
      phoneNumber: doctor1.phoneNumber,
      role: UserRole.DOCTOR,
      doctorId: doctor1._id
    });

    const doctor2 = await Doctor.create({
      firstName: 'Jane',
      lastName: 'Smith',
      specializations: [cosmeticSurgery._id, dermatology._id],
      phoneNumber: '+48123456790',
      email: 'janesmith@clinic.com',
      workingDays: new Map([
        ['monday', { isWorking: true, hours: { start: '10:00', end: '18:00' } }],
        ['tuesday', { isWorking: true, hours: { start: '10:00', end: '18:00' } }],
        ['wednesday', { isWorking: true, hours: { start: '10:00', end: '18:00' } }],
        ['thursday', { isWorking: true, hours: { start: '10:00', end: '18:00' } }],
        ['friday', { isWorking: true, hours: { start: '10:00', end: '16:00' } }],
        ['saturday', { isWorking: false }],
        ['sunday', { isWorking: false }]
      ])
    });

    // Create doctor user account
    const hashedDoctor2Password = await bcrypt.hash('doctor456', 10);
    const doctorUser2 = await User.create({
      username: 'janesmith',
      email: 'janesmith@clinic.com',
      password: hashedDoctor2Password,
      firstName: doctor2.firstName,
      lastName: doctor2.lastName,
      phoneNumber: doctor2.phoneNumber,
      role: UserRole.DOCTOR,
      doctorId: doctor2._id
    });

    // Create patients
    const patient1 = await Patient.create({
      firstName: 'Alice',
      lastName: 'Smith',
      phoneNumber: '+48987654321',
      email: 'alice.smith@example.com',
      birthDate: new Date('1990-05-15'),
      gender: Gender.FEMALE,
      address: {
        street: 'Kwiatowa 1',
        city: 'Warsaw',
        postalCode: '00-001'
      }
    });

    const patient2 = await Patient.create({
      firstName: 'Bob',
      lastName: 'Johnson',
      phoneNumber: '+48987654322',
      email: 'bob.johnson@example.com',
      birthDate: new Date('1985-08-22'),
      gender: Gender.MALE,
      address: {
        street: 'Polna 15',
        city: 'Warsaw',
        postalCode: '00-002'
      }
    });

    // Create treatments
    const treatment1 = await Treatment.create({
      name: 'Botox Injection',
      description: 'Facial wrinkle reduction treatment using botulinum toxin',
      duration: 30, // minutes
      price: 1500,
      specialization: dermatology._id
    });

    const treatment2 = await Treatment.create({
      name: 'Dermal Fillers',
      description: 'Injectable treatment to restore volume and fullness',
      duration: 45, // minutes
      price: 2000,
      specialization: dermatology._id
    });

    const treatment3 = await Treatment.create({
      name: 'Chemical Peel',
      description: 'Skin resurfacing treatment to improve texture and tone',
      duration: 60, // minutes
      price: 800,
      specialization: dermatology._id
    });

    // Create rooms
    const room1 = await Room.create({
      name: 'Room 101',
      description: 'Main treatment room',
      specializations: [dermatology._id] // Room for dermatology treatments
    });

    const room2 = await Room.create({
      name: 'Room 102',
      description: 'Secondary treatment room',
      specializations: [cosmeticSurgery._id, dermatology._id] // Room for both types of treatments
    });

    // Add working days exceptions for doctors
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Set to first Monday of next month
    nextMonth.setDate(1);
    while (nextMonth.getDay() !== 1) { // 1 is Monday
      nextMonth.setDate(nextMonth.getDate() + 1);
    }

    // Doctor 1 will be on vacation first Monday of next month
    await Doctor.findByIdAndUpdate(doctor1._id, {
      $push: {
        workingDaysExceptions: {
          date: new Date(nextMonth),
          isWorking: false
        }
      }
    });

    // Doctor 2 will work extra hours on the same day
    await Doctor.findByIdAndUpdate(doctor2._id, {
      $push: {
        workingDaysExceptions: {
          date: new Date(nextMonth),
          isWorking: true,
          hours: {
            start: '08:00',
            end: '20:00'
          }
        }
      }
    });

    // Create appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // Start at 10:00

    const appointment1 = await Appointment.create({
      doctor: doctor1._id,
      patient: patient1._id,
      treatment: treatment1._id,
      room: room1._id,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + treatment1.duration * 60 * 1000), // Use treatment duration
      price: treatment1.price,
      status: AppointmentStatus.BOOKED,
      paymentStatus: PaymentStatus.UNPAID
    });

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0); // Start at 14:00

    const appointment2 = await Appointment.create({
      doctor: doctor2._id,
      patient: patient2._id,
      treatment: treatment2._id,
      room: room2._id,
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + treatment2.duration * 60 * 1000), // Use treatment duration
      price: treatment2.price,
      status: AppointmentStatus.BOOKED,
      paymentStatus: PaymentStatus.UNPAID
    });

    console.log('Database seeded successfully!');
    console.log('\nTest accounts:');
    console.log('Admin - username: admin, password: admin123');
    console.log('Receptionist - username: receptionist, password: receptionist123');
    console.log('Doctor 1 - username: johndoe, password: doctor123');
    console.log('Doctor 2 - username: janesmith, password: doctor456');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
