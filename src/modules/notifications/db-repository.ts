import { db } from '@/db/client';
import { notifications } from '@/db/schema';
import { eq, and, desc, count, not } from 'drizzle-orm';
import { INotificationRepository } from './repository';
import { Notification } from './service';
import { PaginatedResult } from '@/lib/types';

export class DbNotificationRepository implements INotificationRepository {
  async create(data: Partial<Notification>): Promise<Notification> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db.insert(notifications).values(data as any).returning();
    return result as Notification;
  }

  async update(id: string, data: Partial<Notification>): Promise<Notification> {
    if (!db) throw new Error('Database not connected');
    await db.update(notifications).set(data as any).where(eq(notifications.id, id));
    const result = await db.query.notifications.findFirst({
      where: eq(notifications.id, id),
    });
    if (!result) throw new Error('Notification not found');
    return result as Notification;
  }

  async findByUserId(userId: string, clinicId: string, page = 1, limit = 10): Promise<PaginatedResult<Notification>> {
    if (!db) throw new Error('Database not connected');
    
    const offset = (page - 1) * limit;
    const whereClause = and(
      eq(notifications.userId, userId), 
      eq(notifications.clinicId, clinicId),
      // Prevent system notifications (Admin only) from showing in customer feed
      not(eq(notifications.channel, 'system' as any)) 
    );
    
    const [data, totalResult] = await Promise.all([
      db.query.notifications.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(notifications.createdAt)]
      }),
      db.select({ count: count() }).from(notifications).where(whereClause)
    ]);
    
    const total = Number(totalResult[0]?.count || 0);
    
    return {
      data: data as Notification[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAll(clinicId: string, page = 1, limit = 10, filters?: { isRead?: boolean, type?: string, channel?: string }): Promise<PaginatedResult<Notification>> {
    if (!db) throw new Error('Database not connected');
    
    const offset = (page - 1) * limit;
    
    const conditions = [eq(notifications.clinicId, clinicId)];
    if (filters) {
      if (filters.isRead !== undefined) {
        conditions.push(eq(notifications.isRead, filters.isRead));
      }
      if (filters.type) {
        conditions.push(eq(notifications.type, filters.type as any));
      }
      if (filters.channel) {
        conditions.push(eq(notifications.channel, filters.channel as any));
      }
    }
    const whereClause = and(...conditions);
    
    const [data, totalResult] = await Promise.all([
      db.query.notifications.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(notifications.createdAt)],
        with: {
          user: true,
          appointment: true
        }
      }),
      db.select({ count: count() }).from(notifications).where(whereClause)
    ]);
    
    const total = Number(totalResult[0]?.count || 0);
    
    return {
      data: data as any[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(id: string): Promise<void> {
    if (!db) throw new Error('Database not connected');
    await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(eq(notifications.id, id));
  }

  async markAllAsRead(clinicId: string): Promise<void> {
    if (!db) throw new Error('Database not connected');
    await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(eq(notifications.clinicId, clinicId));
  }

  async getUnreadCount(clinicId: string): Promise<number> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db.select({ count: count() }).from(notifications).where(and(eq(notifications.clinicId, clinicId), eq(notifications.isRead, false)));
    return Number(result?.count || 0);
  }
}
