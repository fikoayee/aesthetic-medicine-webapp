export interface Treatment {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  specialization: string;
  createdAt?: string;
  updatedAt?: string;
}
