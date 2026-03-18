import { db } from '@/db/client';
import { clinics } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { IClinicRepository, Clinic } from './repository';

export class DbClinicRepository implements IClinicRepository {
  async findById(id: string): Promise<Clinic | null> {
    if (!db) throw new Error('Database not connected');
    const result = await db.select().from(clinics).where(eq(clinics.id, id)).limit(1);
    return result[0] || null;
  }

  async findBySlug(slug: string): Promise<Clinic | null> {
    if (!db) throw new Error('Database not connected');
    const result = await db.select().from(clinics).where(eq(clinics.slug, slug)).limit(1);
    return result[0] || null;
  }

  async update(id: string, data: Partial<Omit<Clinic, 'id' | 'slug' | 'createdAt' | 'updatedAt'>>): Promise<Clinic> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db.update(clinics)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clinics.id, id))
      .returning();
    
    if (!result) throw new Error('Clinic not found');
    return result;
  }
}
