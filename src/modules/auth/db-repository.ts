import { IUserRepository } from './repository';
import { User, RegisterInput } from './types';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ROLES } from '@/lib/constants';

export class DbUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await db!.select().from(users).where(eq(users.email, email)).limit(1);
    if (!result[0]) return null;
    const { passwordHash, ...user } = result[0];
    return { ...user, role: user.role as any };
  }

  async findWithPasswordByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
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

  async update(id: string, data: Partial<User>): Promise<User> {
    const result = await db!.update(users).set({
      name: data.name,
      phone: data.phone,
      updatedAt: new Date(),
    }).where(eq(users.id, id)).returning();
    
    return { ...result[0], role: result[0].role as any };
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await db!.update(users).set({
      passwordHash,
      updatedAt: new Date(),
    }).where(eq(users.id, id));
  }
}
