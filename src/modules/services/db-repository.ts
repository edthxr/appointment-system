import { db } from '@/db/client';
import { services } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { IServiceRepository } from './repository';
import { Service, CreateServiceInput, UpdateServiceInput } from './types';

export class DbServiceRepository implements IServiceRepository {
  async findAll(clinicId: string): Promise<Service[]> {
    if (!db) throw new Error('Database not connected');
    const results = await db.query.services.findMany({
      where: eq(services.clinicId, clinicId),
    });
    return results.map(this.mapToEntity);
  }

  async findById(id: string, clinicId: string): Promise<Service | null> {
    if (!db) throw new Error('Database not connected');
    const result = await db.query.services.findFirst({
      where: and(eq(services.id, id), eq(services.clinicId, clinicId)),
    });
    return result ? this.mapToEntity(result) : null;
  }

  async create(data: CreateServiceInput): Promise<Service> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db.insert(services).values({
      ...data,
      price: data.price.toString(),
    }).returning();
    return this.mapToEntity(result);
  }

  async update(id: string, clinicId: string, data: UpdateServiceInput): Promise<Service> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db.update(services)
      .set({
        ...data,
        price: data.price?.toString(),
        updatedAt: new Date(),
      })
      .where(and(eq(services.id, id), eq(services.clinicId, clinicId)))
      .returning();
    return this.mapToEntity(result);
  }

  async delete(id: string, clinicId: string): Promise<void> {
    if (!db) throw new Error('Database not connected');
    await db.delete(services).where(and(eq(services.id, id), eq(services.clinicId, clinicId)));
  }

  private mapToEntity(data: any): Service {
    return {
      ...data,
      price: parseFloat(data.price),
    };
  }
}
