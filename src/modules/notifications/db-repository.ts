import { db } from '@/db/client';
import { notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { INotificationRepository } from './repository';
import { Notification } from './service';

export class DbNotificationRepository implements INotificationRepository {
  async create(data: Partial<Notification>): Promise<Notification> {
    if (!db) throw new Error('Database not connected');
    const [result] = await db.insert(notifications).values(data as any).returning();
    return result as Notification;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    if (!db) throw new Error('Database not connected');
    const results = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
    });
    return results as Notification[];
  }
}
