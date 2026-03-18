import { Role } from '@/lib/constants';
import { z } from 'zod';
import { loginSchema } from './validations';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: User;
  token?: string;
}

export interface LoginCredentials {
  email: z.infer<typeof loginSchema>['email'];
  password: z.infer<typeof loginSchema>['password'];
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
}
