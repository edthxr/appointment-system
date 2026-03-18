import { User, LoginCredentials, RegisterInput } from './types';
import { ROLES } from '@/lib/constants';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findWithPasswordByEmail(email: string): Promise<(User & { passwordHash: string }) | null>;
  findById(id: string): Promise<User | null>;
  create(data: RegisterInput & { passwordHash: string }): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
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
  async findWithPasswordByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const user = MOCK_USERS.find((u) => u.email === email);
    if (!user) return null;
    return { ...user, passwordHash: '$2a$10$dummyhash' }; // Mock hash
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

  async update(id: string, data: Partial<User>): Promise<User> {
    const index = MOCK_USERS.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    MOCK_USERS[index] = { ...MOCK_USERS[index], ...data };
    return MOCK_USERS[index];
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const index = MOCK_USERS.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    // In mock, we don't store password hashes permanently, just simulate success
  }
}
