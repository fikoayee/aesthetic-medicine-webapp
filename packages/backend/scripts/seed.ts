import mongoose, { Types } from 'mongoose';
import { User, UserRole } from '../src/models/User';
import { Doctor } from '../src/models/Doctor';
import { Patient, Gender } from '../src/models/Patient';
import { Treatment } from '../src/models/Treatment';
import { Room } from '../src/models/Room';
import { Appointment, AppointmentStatus, PaymentStatus } from '../src/models/Appointment';
import { Specialization } from '../src/models/Specialization';

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aesthetic-clinic');
    
    // Clear existing data
    await mongoose?.connection?.db?.dropDatabase();

    // Create specializations first
    const specializations = await Promise.all([
      Specialization.create({
        name: 'Dermatology',
        description: 'Skin treatments and conditions'
      }),
      Specialization.create({
        name: 'Facial Aesthetics',
        description: 'Non-surgical facial enhancement procedures'
      }),
      Specialization.create({
        name: 'Body Contouring',
        description: 'Body sculpting and fat reduction treatments'
      }),
      Specialization.create({
        name: 'Laser Therapy',
        description: 'Advanced laser treatments for skin and hair'
      }),
      Specialization.create({
        name: 'Anti-Aging Medicine',
        description: 'Age management and rejuvenation treatments'
      }),
      Specialization.create({
        name: 'Medical Cosmetology',
        description: 'Advanced cosmetic procedures and treatments'
      })
    ]);

    // Create treatments for each specialization
    const treatmentData = [
      // Dermatology treatments
      {
        name: 'Acne Treatment',
        description: 'Advanced treatment for acne and scarring',
        duration: 45,
        price: 400,
        specialization: specializations[0]._id
      },
      {
        name: 'Skin Analysis',
        description: 'Comprehensive skin condition analysis',
        duration: 30,
        price: 200,
        specialization: specializations[0]._id
      },
      {
        name: 'Chemical Peel',
        description: 'Skin resurfacing treatment',
        duration: 60,
        price: 600,
        specialization: specializations[0]._id
      },
      {
        name: 'Dermabrasion',
        description: 'Mechanical exfoliation treatment',
        duration: 45,
        price: 500,
        specialization: specializations[0]._id
      },
      // Facial Aesthetics treatments
      {
        name: 'Botox Injection',
        description: 'Wrinkle reduction treatment',
        duration: 30,
        price: 1200,
        specialization: specializations[1]._id
      },
      {
        name: 'Dermal Fillers',
        description: 'Volume restoration treatment',
        duration: 45,
        price: 1500,
        specialization: specializations[1]._id
      },
      {
        name: 'Lip Enhancement',
        description: 'Lip augmentation procedure',
        duration: 30,
        price: 800,
        specialization: specializations[1]._id
      },
      {
        name: 'Face Lifting',
        description: 'Non-surgical face lifting',
        duration: 90,
        price: 2500,
        specialization: specializations[1]._id
      },
      // Body Contouring treatments
      {
        name: 'CoolSculpting',
        description: 'Fat freezing treatment',
        duration: 120,
        price: 3000,
        specialization: specializations[2]._id
      },
      {
        name: 'Ultrasound Therapy',
        description: 'Non-invasive fat reduction',
        duration: 75,
        price: 1800,
        specialization: specializations[2]._id
      },
      {
        name: 'Body Sculpting',
        description: 'Targeted fat reduction',
        duration: 90,
        price: 2200,
        specialization: specializations[2]._id
      },
      {
        name: 'Cellulite Treatment',
        description: 'Advanced cellulite reduction',
        duration: 60,
        price: 1500,
        specialization: specializations[2]._id
      },
      // Laser Therapy treatments
      {
        name: 'Laser Hair Removal',
        description: 'Permanent hair reduction',
        duration: 45,
        price: 600,
        specialization: specializations[3]._id
      },
      {
        name: 'Laser Skin Resurfacing',
        description: 'Skin texture improvement',
        duration: 75,
        price: 1200,
        specialization: specializations[3]._id
      },
      {
        name: 'Laser Vein Treatment',
        description: 'Spider vein removal',
        duration: 30,
        price: 800,
        specialization: specializations[3]._id
      },
      {
        name: 'Pigmentation Treatment',
        description: 'Laser treatment for dark spots',
        duration: 45,
        price: 900,
        specialization: specializations[3]._id
      },
      // Anti-Aging Medicine treatments
      {
        name: 'PRP Therapy',
        description: 'Platelet-rich plasma treatment',
        duration: 60,
        price: 1500,
        specialization: specializations[4]._id
      },
      {
        name: 'Mesotherapy',
        description: 'Skin rejuvenation injections',
        duration: 45,
        price: 1000,
        specialization: specializations[4]._id
      },
      {
        name: 'Anti-Aging Consultation',
        description: 'Comprehensive aging assessment',
        duration: 30,
        price: 300,
        specialization: specializations[4]._id
      },
      {
        name: 'Collagen Induction',
        description: 'Natural collagen stimulation',
        duration: 90,
        price: 1800,
        specialization: specializations[4]._id
      },
      // Medical Cosmetology treatments
      {
        name: 'Medical Facial',
        description: 'Advanced skincare treatment',
        duration: 60,
        price: 800,
        specialization: specializations[5]._id
      },
      {
        name: 'Micro-needling',
        description: 'Collagen induction therapy',
        duration: 45,
        price: 700,
        specialization: specializations[5]._id
      },
      {
        name: 'LED Light Therapy',
        description: 'Phototherapy treatment',
        duration: 30,
        price: 400,
        specialization: specializations[5]._id
      },
      {
        name: 'Hydrafacial',
        description: 'Deep cleansing treatment',
        duration: 75,
        price: 1000,
        specialization: specializations[5]._id
      }
    ];

    const treatments = await Treatment.create(treatmentData);

    // Create rooms
    const rooms = await Promise.all([
      Room.create({
        name: 'Treatment Room 101',
        description: 'Primary treatment room for facial procedures',
        specializations: [specializations[0]._id, specializations[1]._id]
      }),
      Room.create({
        name: 'Laser Suite 102',
        description: 'Specialized room for laser treatments',
        specializations: [specializations[3]._id]
      }),
      Room.create({
        name: 'Body Contouring Room 103',
        description: 'Equipped for body sculpting procedures',
        specializations: [specializations[2]._id]
      }),
      Room.create({
        name: 'Medical Spa 104',
        description: 'Luxury treatment room for combined procedures',
        specializations: [specializations[4]._id, specializations[5]._id]
      }),
      Room.create({
        name: 'Consultation Room 105',
        description: 'Private room for consultations and minor procedures',
        specializations: specializations.map(spec => spec._id)
      }),
      Room.create({
        name: 'Premium Suite 106',
        description: 'VIP treatment room for all procedures',
        specializations: specializations.map(spec => spec._id)
      })
    ]);

    // Create doctors with more realistic schedules and specializations
    const doctorData = [
      {
        firstName: 'John',
        lastName: 'Doe',
        specializations: [specializations[0]._id, specializations[1]._id],
        phoneNumber: '+48123456789',
        email: 'johndoe@clinic.com',
        username: 'johndoe',
        password: 'doctor123'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        specializations: [specializations[1]._id, specializations[4]._id],
        phoneNumber: '+48123456790',
        email: 'janesmith@clinic.com',
        username: 'janesmith',
        password: 'doctor456'
      },
      {
        firstName: 'Michael',
        lastName: 'Johnson',
        specializations: [specializations[2]._id, specializations[3]._id],
        phoneNumber: '+48123456791',
        email: 'mjohnson@clinic.com',
        username: 'mjohnson',
        password: 'doctor789'
      },
      {
        firstName: 'Sarah',
        lastName: 'Williams',
        specializations: [specializations[3]._id, specializations[5]._id],
        phoneNumber: '+48123456792',
        email: 'swilliams@clinic.com',
        username: 'swilliams',
        password: 'doctor101'
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        specializations: [specializations[4]._id, specializations[5]._id],
        phoneNumber: '+48123456793',
        email: 'dbrown@clinic.com',
        username: 'dbrown',
        password: 'doctor102'
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        specializations: [specializations[0]._id, specializations[5]._id],
        phoneNumber: '+48123456794',
        email: 'edavis@clinic.com',
        username: 'edavis',
        password: 'doctor103'
      },
      {
        firstName: 'Robert',
        lastName: 'Wilson',
        specializations: [specializations[1]._id, specializations[2]._id],
        phoneNumber: '+48123456795',
        email: 'rwilson@clinic.com',
        username: 'rwilson',
        password: 'doctor104'
      },
      {
        firstName: 'Lisa',
        lastName: 'Anderson',
        specializations: [specializations[2]._id, specializations[4]._id],
        phoneNumber: '+48123456796',
        email: 'landerson@clinic.com',
        username: 'landerson',
        password: 'doctor105'
      }
    ];

    // Create doctors and their user accounts
    const doctors = await Promise.all(
      doctorData.map(async (data) => {
        const doctor = await Doctor.create({
          firstName: data.firstName,
          lastName: data.lastName,
          specializations: data.specializations,
          phoneNumber: data.phoneNumber,
          email: data.email,
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

        await User.create({
          username: data.username,
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          role: UserRole.DOCTOR,
          doctorId: doctor._id
        });

        return doctor;
      })
    );

    // Create more patients
    const patientData = [
      {
        firstName: 'Anna',
        lastName: 'Kowalska',
        phoneNumber: '+48501234567',
        email: 'anna.kowalska@example.com',
        birthDate: new Date('1992-03-15'),
        gender: Gender.FEMALE,
        address: {
          street: 'Marszałkowska 126',
          city: 'Warsaw',
          postalCode: '00-008'
        }
      },
      {
        firstName: 'Piotr',
        lastName: 'Nowak',
        phoneNumber: '+48602345678',
        email: 'piotr.nowak@example.com',
        birthDate: new Date('1985-07-22'),
        gender: Gender.MALE,
        address: {
          street: 'Długa 45',
          city: 'Krakow',
          postalCode: '31-147'
        }
      },
      {
        firstName: 'Maria',
        lastName: 'Wiśniewska',
        phoneNumber: '+48703456789',
        email: 'maria.wisniewska@example.com',
        birthDate: new Date('1990-11-30'),
        gender: Gender.FEMALE,
        address: {
          street: 'Piotrkowska 85',
          city: 'Lodz',
          postalCode: '90-423'
        }
      },
      {
        firstName: 'Tomasz',
        lastName: 'Wójcik',
        phoneNumber: '+48804567890',
        email: 'tomasz.wojcik@example.com',
        birthDate: new Date('1988-04-12'),
        gender: Gender.MALE,
        address: {
          street: 'Świętojańska 15',
          city: 'Gdynia',
          postalCode: '81-368'
        }
      },
      {
        firstName: 'Katarzyna',
        lastName: 'Lewandowska',
        phoneNumber: '+48905678901',
        email: 'katarzyna.lewandowska@example.com',
        birthDate: new Date('1995-09-03'),
        gender: Gender.FEMALE,
        address: {
          street: 'Mickiewicza 22',
          city: 'Poznan',
          postalCode: '60-834'
        }
      },
      {
        firstName: 'Marcin',
        lastName: 'Kamiński',
        phoneNumber: '+48606789012',
        email: 'marcin.kaminski@example.com',
        birthDate: new Date('1983-12-18'),
        gender: Gender.MALE,
        address: {
          street: 'Sienkiewicza 8',
          city: 'Wroclaw',
          postalCode: '50-335'
        }
      },
      {
        firstName: 'Agnieszka',
        lastName: 'Zielińska',
        phoneNumber: '+48707890123',
        email: 'agnieszka.zielinska@example.com',
        birthDate: new Date('1991-06-25'),
        gender: Gender.FEMALE,
        address: {
          street: 'Kościuszki 45',
          city: 'Szczecin',
          postalCode: '70-467'
        }
      },
      {
        firstName: 'Michał',
        lastName: 'Szymański',
        phoneNumber: '+48808901234',
        email: 'michal.szymanski@example.com',
        birthDate: new Date('1987-02-14'),
        gender: Gender.MALE,
        address: {
          street: 'Wojska Polskiego 33',
          city: 'Gdansk',
          postalCode: '80-268'
        }
      },
      {
        firstName: 'Ewa',
        lastName: 'Dąbrowska',
        phoneNumber: '+48909012345',
        email: 'ewa.dabrowska@example.com',
        birthDate: new Date('1993-08-07'),
        gender: Gender.FEMALE,
        address: {
          street: 'Piłsudskiego 12',
          city: 'Bialystok',
          postalCode: '15-444'
        }
      },
      {
        firstName: 'Krzysztof',
        lastName: 'Kozłowski',
        phoneNumber: '+48500123456',
        email: 'krzysztof.kozlowski@example.com',
        birthDate: new Date('1986-01-29'),
        gender: Gender.MALE,
        address: {
          street: 'Reymonta 55',
          city: 'Lublin',
          postalCode: '20-029'
        }
      },
      {
        firstName: 'Magdalena',
        lastName: 'Jankowska',
        phoneNumber: '+48601234567',
        email: 'magdalena.jankowska@example.com',
        birthDate: new Date('1994-05-16'),
        gender: Gender.FEMALE,
        address: {
          street: 'Słowackiego 28',
          city: 'Katowice',
          postalCode: '40-093'
        }
      },
      {
        firstName: 'Paweł',
        lastName: 'Mazur',
        phoneNumber: '+48702345678',
        email: 'pawel.mazur@example.com',
        birthDate: new Date('1989-10-21'),
        gender: Gender.MALE,
        address: {
          street: 'Konopnickiej 17',
          city: 'Bydgoszcz',
          postalCode: '85-092'
        }
      },
      {
        firstName: 'Aleksandra',
        lastName: 'Krawczyk',
        phoneNumber: '+48803456789',
        email: 'aleksandra.krawczyk@example.com',
        birthDate: new Date('1996-07-04'),
        gender: Gender.FEMALE,
        address: {
          street: 'Żeromskiego 39',
          city: 'Rzeszow',
          postalCode: '35-030'
        }
      },
      {
        firstName: 'Jakub',
        lastName: 'Grabowski',
        phoneNumber: '+48904567890',
        email: 'jakub.grabowski@example.com',
        birthDate: new Date('1984-03-11'),
        gender: Gender.MALE,
        address: {
          street: 'Chopina 7',
          city: 'Olsztyn',
          postalCode: '10-004'
        }
      },
      {
        firstName: 'Monika',
        lastName: 'Pawłowska',
        phoneNumber: '+48505678901',
        email: 'monika.pawlowska@example.com',
        birthDate: new Date('1992-12-30'),
        gender: Gender.FEMALE,
        address: {
          street: 'Norwida 14',
          city: 'Czestochowa',
          postalCode: '42-202'
        }
      },
      {
        firstName: 'Łukasz',
        lastName: 'Michalski',
        phoneNumber: '+48606789012',
        email: 'lukasz.michalski@example.com',
        birthDate: new Date('1988-09-19'),
        gender: Gender.MALE,
        address: {
          street: 'Asnyka 23',
          city: 'Radom',
          postalCode: '26-610'
        }
      },
      {
        firstName: 'Natalia',
        lastName: 'Nowicka',
        phoneNumber: '+48707890123',
        email: 'natalia.nowicka@example.com',
        birthDate: new Date('1995-04-26'),
        gender: Gender.FEMALE,
        address: {
          street: 'Prusa 31',
          city: 'Kielce',
          postalCode: '25-316'
        }
      },
      {
        firstName: 'Bartosz',
        lastName: 'Adamczyk',
        phoneNumber: '+48808901234',
        email: 'bartosz.adamczyk@example.com',
        birthDate: new Date('1987-11-08'),
        gender: Gender.MALE,
        address: {
          street: 'Wyspiańskiego 42',
          city: 'Torun',
          postalCode: '87-100'
        }
      },
      {
        firstName: 'Karolina',
        lastName: 'Sikora',
        phoneNumber: '+48909012345',
        email: 'karolina.sikora@example.com',
        birthDate: new Date('1993-06-13'),
        gender: Gender.FEMALE,
        address: {
          street: 'Matejki 19',
          city: 'Gliwice',
          postalCode: '44-100'
        }
      },
      {
        firstName: 'Damian',
        lastName: 'Walczak',
        phoneNumber: '+48500123456',
        email: 'damian.walczak@example.com',
        birthDate: new Date('1986-08-24'),
        gender: Gender.MALE,
        address: {
          street: 'Reja 11',
          city: 'Zabrze',
          postalCode: '41-800'
        }
      }
    ];

    const patients = await Promise.all(patientData.map(data => Patient.create(data)));

    // Create appointments for 2025
    const startDate = new Date('2025-02-06T09:00:00.000Z');
    const endDate = new Date('2025-03-06T17:00:00.000Z');
    
    const appointments: Array<{
      doctor: Types.ObjectId;
      patient: Types.ObjectId;
      treatment: Types.ObjectId;
      room: Types.ObjectId;
      startTime: Date;
      endTime: Date;
      price: number;
      status: AppointmentStatus;
      paymentStatus: PaymentStatus;
    }> = [];
    
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Skip weekends
        for (const doctor of doctors) {
          // Create 2-4 appointments per day for each doctor
          const appointmentsPerDay = 2 + Math.floor(Math.random() * 3);
          
          for (let i = 0; i < appointmentsPerDay; i++) {
            const doctorSpecs = doctor.specializations;
            const availableTreatments = treatments.filter(t => 
              doctorSpecs.some(spec => spec.toString() === t.specialization.toString())
            );
            
            const treatment = availableTreatments[Math.floor(Math.random() * availableTreatments.length)];
            const patient = patients[Math.floor(Math.random() * patients.length)];
            const room = rooms.find(r => 
              r.specializations.some(s => s.toString() === treatment.specialization.toString())
            );
            
            // Skip if no suitable room found
            if (!room) continue;
            
            const appointmentDate = new Date(currentDate);
            appointmentDate.setHours(9 + i * 2); // Space appointments every 2 hours
            
            const appointment = {
              doctor: doctor._id as Types.ObjectId,
              patient: patient._id as Types.ObjectId,
              treatment: treatment._id as Types.ObjectId,
              room: room._id as Types.ObjectId,
              startTime: new Date(appointmentDate),
              endTime: new Date(appointmentDate.getTime() + treatment.duration * 60 * 1000),
              price: treatment.price,
              status: AppointmentStatus.BOOKED,
              paymentStatus: Math.random() > 0.3 ? PaymentStatus.PAID : PaymentStatus.UNPAID
            };
            
            appointments.push(appointment);
          }
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    await Appointment.create(appointments);

    // Create admin and receptionist users
    const admin = await User.create({
      username: 'admin',
      email: 'admin@clinic.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+48123456788',
      role: UserRole.ADMIN
    });

    const receptionist = await User.create({
      username: 'receptionist',
      email: 'receptionist@clinic.com',
      password: 'receptionist123',
      firstName: 'Reception',
      lastName: 'Staff',
      phoneNumber: '+48123456787',
      role: UserRole.RECEPTIONIST
    });

    console.log('Database seeded successfully!');
    console.log('\nTest accounts:');
    console.log('Admin - username: admin, password: admin123');
    console.log('Receptionist - username: receptionist, password: receptionist123');
    console.log('Doctors:');
    for (const doctor of doctorData) {
      console.log(`${doctor.firstName} ${doctor.lastName} - username: ${doctor.username}, password: ${doctor.password}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
