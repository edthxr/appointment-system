import { User, LoginCredentials, RegisterInput } from './types';
import { ROLES } from '@/lib/constants';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: RegisterInput & { passwordHash: string }): Promise<User>;
}

const MOCK_USERS: User[] = [
  {
    id: 'u0',
    name: 'System Admin',
    email: 'admin@example.com',
    role: ROLES.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'u1',
    name: 'John Doe',
    email: 'user@example.com',
    role: ROLES.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class MockUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return MOCK_USERS.find((u) => u.email === email) || null;
  }
  async findById(id: string): Promise<User | null> {
    return MOCK_USERS.find((u) => u.id === id) || null;
  }
  async create(data: RegisterInput & { passwordHash: string }): Promise<User> {
    const newUser: User = {
      id: `u-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: ROLES.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MOCK_USERS.push(newUser);
    return newUser;
  }
}
