import { db } from '@/db/client';
import { appointments, services, users, businessHours, blockedSlots } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { IBookingRepository } from './repository';
import { Appointment, CreateBookingInput, BusinessHours, BlockedSlot } from './types';
import { format } from 'date-fns';
import { APPOINTMENT_STATUS } from '@/lib/constants';

export class DbBookingRepository implements IBookingRepository {
  async findAll(): Promise<Appointment[]> {
    if (!db) throw new Error('Database not connected');
    const results = await db.query.appointments.findMany({
      with: {
        user: true,
        service: true,
      }
    });
    return results.map(this.mapToEntity);
  }

  async findByUserId(userId: string): Promise<Appointment[]> {
    if (!db) throw new Error('Database not connected');
    const results = await db.query.appointments.findMany({
      where: eq(appointments.userId, userId),
      with: {
        service: true,
      }
    });
    return results.map(this.mapToEntity);
  }

  async findById(id: string): Promise<Appointment | null> {
    if (!db) throw new Error('Database not connected');
    const result = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
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
    
    // Fetch again with RELATIONS if needed or just return mapped
    return this.findById(result.id) as Promise<Appointment>;
  }

  async updateStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    if (!db) throw new Error('Database not connected');
    await db.update(appointments).set({ status, updatedAt: new Date() }).where(eq(appointments.id, id));
    return this.findById(id) as Promise<Appointment>;
  }

  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    if (!db) throw new Error('Database not connected');
    const dStr = format(date, 'yyyy-MM-dd');
    const results = await db.query.appointments.findMany({
      where: sql`DATE(${appointments.appointmentDate}) = ${dStr}`,
    });
    return results.map(this.mapToEntity);
  }

  async getBusinessHours(): Promise<BusinessHours[]> {
    if (!db) throw new Error('Database not connected');
    return await db.query.businessHours.findMany();
  }

  async getBlockedSlots(date: Date): Promise<BlockedSlot[]> {
    if (!db) throw new Error('Database not connected');
    const dStr = format(date, 'yyyy-MM-dd');
    return await db.query.blockedSlots.findMany({
      where: sql`DATE(${blockedSlots.blockedDate}) = ${dStr}`,
    });
  }

  private mapToEntity(data: any): Appointment {
    return {
      ...data,
      // Ensure specific fields are correctly types if needed
    };
  }
}
