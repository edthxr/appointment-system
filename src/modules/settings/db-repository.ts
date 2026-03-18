import { db } from '@/db/client';
import { businessHours, blockedSlots } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { ISettingRepository } from './repository';
import { BusinessHours, BlockedSlot } from '../bookings/types';
import { format } from 'date-fns';

export class DbSettingRepository implements ISettingRepository {
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
}
