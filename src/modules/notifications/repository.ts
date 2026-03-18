import { Notification } from './service';
import { PaginatedResult } from '@/lib/types';

export interface INotificationRepository {
  create(data: Partial<Notification>): Promise<Notification>;
  findByUserId(userId: string, clinicId: string, page?: number, limit?: number): Promise<PaginatedResult<Notification>>;
}

export class MockNotificationRepository implements INotificationRepository {
  private notifications: Notification[] = [];

  async create(data: Partial<Notification>): Promise<Notification> {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId: data.userId || 'unknown',
      appointmentId: data.appointmentId,
      channel: data.channel || 'email',
      type: data.type || 'booking_created',
      message: data.message || '',
      status: 'pending',
      createdAt: new Date(),
    };
    this.notifications.push(newNotif);
    return newNotif;
  }

  async findByUserId(userId: string, clinicId: string, page = 1, limit = 10): Promise<PaginatedResult<Notification>> {
    let filtered = this.notifications.filter(n => n.userId === userId);
    
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);
    
    return {
      data,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }
}
