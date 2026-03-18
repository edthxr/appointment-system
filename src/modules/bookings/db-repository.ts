import { db } from '@/db/client';
import { appointments, services, users, businessHours, blockedSlots } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { IBookingRepository } from './repository';
import { Appointment, CreateBookingInput, BusinessHours, BlockedSlot } from './types';
import { format } from 'date-fns';
import { APPOINTMENT_STATUS } from '@/lib/constants';

export class DbBookingRepository implements IBookingRepository {
  async findAll(clinicId: string): Promise<Appointment[]> {
    if (!db) throw new Error('Database not connected');
    const results = await db.query.appointments.findMany({
      where: eq(appointments.clinicId, clinicId),
      with: {
        user: true,
        service: true,
      }
    });
    return results.map(this.mapToEntity);
  }

  async findByUserId(userId: string, clinicId: string): Promise<Appointment[]> {
    if (!db) throw new Error('Database not connected');
    const results = await db.query.appointments.findMany({
      where: and(eq(appointments.userId, userId), eq(appointments.clinicId, clinicId)),
      with: {
        service: true,
      }
    });
    return results.map(this.mapToEntity);
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

  private mapToEntity(data: any): Appointment {
    return {
      ...data,
    };
  }
}
