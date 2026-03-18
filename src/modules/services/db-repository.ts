import { db } from '@/db/client';
import { services } from '@/db/schema';
import { and, eq, count, or, ilike, sql } from 'drizzle-orm';
import { IServiceRepository } from './repository';
import { Service, CreateServiceInput, UpdateServiceInput } from './types';
import { PaginatedResult } from '@/lib/types';

export class DbServiceRepository implements IServiceRepository {
  async findAll(clinicId: string, page = 1, limit = 10, search?: string): Promise<PaginatedResult<Service>> {
    if (!db) throw new Error('Database not connected');
    
    const offset = (page - 1) * limit;

    const filters = [eq(services.clinicId, clinicId)];
    
    if (search) {
      const searchPattern = `%${search}%`;
      const searchFilters = [
        ilike(services.name, searchPattern),
        ilike(services.description, searchPattern),
        // Search in price and duration by casting to text
        sql`CAST(${services.price} AS TEXT) ILIKE ${searchPattern}`,
        sql`CAST(${services.durationMin} AS TEXT) ILIKE ${searchPattern}`,
      ];

      // Special handling for status
      const searchLower = search.toLowerCase();
      if ('active'.includes(searchLower)) {
        searchFilters.push(eq(services.isActive, true));
      } else if ('archived'.includes(searchLower) || 'inactive'.includes(searchLower)) {
        searchFilters.push(eq(services.isActive, false));
      }

      filters.push(or(...searchFilters)!);
    }

    const whereClause = and(...filters);

    const [totalResult] = await db.select({ value: count() })
      .from(services)
      .where(whereClause);
    
    const total = totalResult.value;

    const results = await db.query.services.findMany({
      where: whereClause,
      limit,
      offset,
    });

    return {
      data: results.map(this.mapToEntity),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
