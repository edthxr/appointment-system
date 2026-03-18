import { db } from '@/db/client';
import { notifications } from '@/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
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
    const whereClause = and(eq(notifications.userId, userId), eq(notifications.clinicId, clinicId));
    
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

  async findAll(clinicId: string, page = 1, limit = 10): Promise<PaginatedResult<Notification>> {
    if (!db) throw new Error('Database not connected');
    
    const offset = (page - 1) * limit;
    
    const [data, totalResult] = await Promise.all([
      db.query.notifications.findMany({
        where: eq(notifications.clinicId, clinicId),
        limit,
        offset,
        orderBy: [desc(notifications.createdAt)],
        with: {
          user: true,
          appointment: true
        }
      }),
      db.select({ count: count() }).from(notifications).where(eq(notifications.clinicId, clinicId))
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
}
