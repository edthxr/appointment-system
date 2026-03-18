import { AppointmentStatus } from '@/lib/constants';

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  durationMin: number;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  durationMin: number;
  price: number;
  isActive?: boolean;
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {
  id: string;
}
