export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NOT_SPECIFIED = 'not_specified'
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
}

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  birthDate: string;
  address: Address;
  lastVisit?: string;
  treatmentCount?: number;
}
