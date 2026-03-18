import { db } from '@/db/client';
import { notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { INotificationRepository } from './repository';
import { Notification } from './service';
import { PaginatedResult } from '@/lib/types';

export class DbNotificationRepository implements INotificationRepository {
  async create(data: Partial<Notification>): Promise<Notification> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db.insert(notifications).values(data as any).returning();
    return result as Notification;
  }

  async findByUserId(userId: string, clinicId: string, page = 1, limit = 10): Promise<PaginatedResult<Notification>> {
    if (!db) throw new Error('Database not connected');
    
    const offset = (page - 1) * limit;
    
    const [data, totalResult] = await Promise.all([
      db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
        limit,
        offset,
      }),
      db.select({ count: notifications.id }).from(notifications).where(eq(notifications.userId, userId))
    ]);
    
    const total = totalResult.length;
    
    return {
      data: data as Notification[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
