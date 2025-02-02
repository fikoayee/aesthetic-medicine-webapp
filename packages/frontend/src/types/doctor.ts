interface WorkingHours {
  start: string;  // Format: "HH:mm"
  end: string;    // Format: "HH:mm"
}

interface WorkingDay {
  isWorking: boolean;
  hours?: WorkingHours;
}

interface WorkingDayException {
  date: string;
  isWorking: boolean;
  hours?: WorkingHours;
}

export interface Specialization {
  _id: string;
  name: string;
  description?: string;
  treatments: string[];
}

export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specializations: Specialization[];
  phoneNumber: string;
  email: string;
  workingDays: Record<string, WorkingDay>;
  workingDaysExceptions: WorkingDayException[];
  createdAt?: string;
  updatedAt?: string;
}
