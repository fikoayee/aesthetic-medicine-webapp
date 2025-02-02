export interface Specialization {
  _id: string;
  name: string;
  description: string;
  treatmentIds: string[]; // IDs of treatments that belong to this specialization
}

// Doctor's specializations
export interface DoctorSpecialization {
  doctorId: string;
  specializationIds: string[];
}

// Room's specializations
export interface RoomSpecialization {
  roomId: string;
  specializationIds: string[];
}
