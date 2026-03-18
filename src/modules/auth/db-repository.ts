import { IUserRepository } from './repository';
import { User, RegisterInput } from './types';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ROLES } from '@/lib/constants';

export class DbUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await db!.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] ? { ...result[0], role: result[0].role as any } : null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await db!.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] ? { ...result[0], role: result[0].role as any } : null;
  }

  async create(data: RegisterInput & { passwordHash: string }): Promise<User> {
    const result = await db!.insert(users).values({
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash: data.passwordHash,
      role: ROLES.USER,
    }).returning();
    
    return { ...result[0], role: result[0].role as any };
  }
}
