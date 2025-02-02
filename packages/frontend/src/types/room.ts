import { Specialization } from './doctor';

export interface Room {
  _id: string;
  name: string;
  description: string;
  specializations: Specialization[];
  createdAt?: string;
  updatedAt?: string;
}
