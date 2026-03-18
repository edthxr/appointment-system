export interface Service {
  id: string;
  clinicId: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceInput {
  clinicId: string;
  name: string;
  description?: string;
  durationMin: number;
  price: number;
  isActive?: boolean;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  durationMin?: number;
  price?: number;
  isActive?: boolean;
}
