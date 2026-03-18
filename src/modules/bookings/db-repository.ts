import { db } from '@/db/client';
import { appointments, services, users, businessHours, blockedSlots } from '@/db/schema';
import { eq, and, sql, count, or, ilike, exists } from 'drizzle-orm';
import { IBookingRepository } from './repository';
import { Appointment, CreateBookingInput, BusinessHours, BlockedSlot } from './types';
import { format } from 'date-fns';
import { APPOINTMENT_STATUS } from '@/lib/constants';
import { PaginatedResult } from '@/lib/types';

export class DbBookingRepository implements IBookingRepository {
  async findAll(clinicId: string, page = 1, limit = 10, search?: string, sortBy?: string, sortOrder: 'asc' | 'desc' = 'asc'): Promise<PaginatedResult<Appointment>> {
    if (!db) throw new Error('Database not connected');
    
    const offset = (page - 1) * limit;
    const filters = [eq(appointments.clinicId, clinicId)];

    if (search) {
      const sp = `%${search}%`;
      filters.push(or(
        ilike(appointments.status, sp),
        // Relationship filtering via exists
        exists(
          db.select().from(users).where(and(
            eq(users.id, appointments.userId),
            or(ilike(users.name, sp), ilike(users.email, sp))
          ))
        ),
        exists(
          db.select().from(services).where(and(
            eq(services.id, appointments.serviceId),
            ilike(services.name, sp)
          ))
        )
      )!);
    }

    const whereClause = and(...filters);

    const [totalResult] = await db.select({ value: count() })
      .from(appointments)
      .where(whereClause);
    
    const total = totalResult.value;

    const results = await db.query.appointments.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (appointments, { asc, desc }) => {
        if (!sortBy) return [desc(appointments.appointmentDate)];
        
        let column;
        switch (sortBy) {
          case 'appointmentDate':
          case 'date':
            column = appointments.appointmentDate;
            break;
          case 'status':
            column = appointments.status;
            break;
          default:
            column = appointments.appointmentDate;
        }
        return sortOrder === 'desc' ? [desc(column)] : [asc(column)];
      },
      with: {
        user: true,
        service: true,
      }
    });

    return {
      data: results.map(this.mapToEntity),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUserId(userId: string, clinicId: string, page = 1, limit = 10, search?: string, sortBy?: string, sortOrder: 'asc' | 'desc' = 'asc'): Promise<PaginatedResult<Appointment>> {
    if (!db) throw new Error('Database not connected');
    
    const offset = (page - 1) * limit;
    const filters = [
      eq(appointments.userId, userId),
      eq(appointments.clinicId, clinicId)
    ];

    if (search) {
      const sp = `%${search}%`;
      filters.push(or(
        ilike(appointments.status, sp),
        exists(
          db.select().from(services).where(and(
            eq(services.id, appointments.serviceId),
            ilike(services.name, sp)
          ))
        )
      )!);
    }

    const whereClause = and(...filters);

    const [totalResult] = await db.select({ value: count() })
      .from(appointments)
      .where(whereClause);
    
    const total = totalResult.value;

    const results = await db.query.appointments.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (appointments, { asc, desc }) => {
        if (!sortBy) return [desc(appointments.appointmentDate)];
        
        let column;
        switch (sortBy) {
          case 'appointmentDate':
          case 'date':
            column = appointments.appointmentDate;
            break;
          case 'status':
            column = appointments.status;
            break;
          default:
            column = appointments.appointmentDate;
        }
        return sortOrder === 'desc' ? [desc(column)] : [asc(column)];
      },
      with: {
        service: true,
      }
    });

    return {
      data: results.map(this.mapToEntity),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, clinicId: string): Promise<Appointment | null> {
    if (!db) throw new Error('Database not connected');
    const result = await db.query.appointments.findFirst({
      where: and(eq(appointments.id, id), eq(appointments.clinicId, clinicId)),
      with: {
        user: true,
        service: true,
      }
    });
    return result ? this.mapToEntity(result) : null;
  }

  async create(data: CreateBookingInput, endTime: string): Promise<Appointment> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db.insert(appointments).values({
      ...data,
      endTime,
      status: APPOINTMENT_STATUS.PENDING,
    }).returning();
    
    return this.findById(result.id, data.clinicId) as Promise<Appointment>;
  }

  async updateStatus(id: string, clinicId: string, status: Appointment['status']): Promise<Appointment> {
    if (!db) throw new Error('Database not connected');
    await db.update(appointments)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(appointments.id, id), eq(appointments.clinicId, clinicId)));
    return this.findById(id, clinicId) as Promise<Appointment>;
  }

  async getAppointmentsByDate(date: Date, clinicId: string): Promise<Appointment[]> {
    if (!db) throw new Error('Database not connected');
    const dStr = format(date, 'yyyy-MM-dd');
    const results = await db.query.appointments.findMany({
      where: and(
        sql`DATE(${appointments.appointmentDate}) = ${dStr}`,
        eq(appointments.clinicId, clinicId)
      ),
    });
    return results.map(this.mapToEntity);
  }

  async getBusinessHours(clinicId: string): Promise<BusinessHours[]> {
    if (!db) throw new Error('Database not connected');
    return await db.query.businessHours.findMany({
      where: eq(businessHours.clinicId, clinicId),
    });
  }

  async getBlockedSlots(date: Date, clinicId: string): Promise<BlockedSlot[]> {
    if (!db) throw new Error('Database not connected');
    const dStr = format(date, 'yyyy-MM-dd');
    return await db.query.blockedSlots.findMany({
      where: and(
        sql`DATE(${blockedSlots.blockedDate}) = ${dStr}`,
        eq(blockedSlots.clinicId, clinicId)
      ),
    });
  }

  async createBusinessHours(clinicId: string, data: Omit<BusinessHours, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessHours> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db.insert(businessHours).values({
      ...data,
      clinicId,
    }).returning();
    return result;
  }

  async updateBusinessHours(id: string, clinicId: string, data: Partial<BusinessHours>): Promise<BusinessHours> {
    if (!db) throw new Error('Database not connected');
    await db.update(businessHours)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(businessHours.id, id), eq(businessHours.clinicId, clinicId)));
    const result = await db.query.businessHours.findFirst({
      where: and(eq(businessHours.id, id), eq(businessHours.clinicId, clinicId)),
    });
    if (!result) throw new Error('Business hours not found');
    return result;
  }

  async deleteBusinessHours(id: string, clinicId: string): Promise<void> {
    if (!db) throw new Error('Database not connected');
    await db.delete(businessHours)
      .where(and(eq(businessHours.id, id), eq(businessHours.clinicId, clinicId)));
  }

  async createBlockedSlot(clinicId: string, data: Omit<BlockedSlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlockedSlot> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db.insert(blockedSlots).values({
      ...data,
      clinicId,
    }).returning();
    return result;
  }

  async updateBlockedSlot(id: string, clinicId: string, data: Partial<BlockedSlot>): Promise<BlockedSlot> {
    if (!db) throw new Error('Database not connected');
    await db.update(blockedSlots)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(blockedSlots.id, id), eq(blockedSlots.clinicId, clinicId)));
    const result = await db.query.blockedSlots.findFirst({
      where: and(eq(blockedSlots.id, id), eq(blockedSlots.clinicId, clinicId)),
    });
    if (!result) throw new Error('Blocked slot not found');
    return result;
  }

  async deleteBlockedSlot(id: string, clinicId: string): Promise<void> {
    if (!db) throw new Error('Database not connected');
    await db.delete(blockedSlots)
      .where(and(eq(blockedSlots.id, id), eq(blockedSlots.clinicId, clinicId)));
  }

  private mapToEntity(data: any): Appointment {
    return {
      ...data,
    };
  }
}
