import { Notification } from './service';
import { PaginatedResult } from '@/lib/types';

export interface INotificationRepository {
  create(data: Partial<Notification>): Promise<Notification>;
  update(id: string, data: Partial<Notification>): Promise<Notification>;
  findByUserId(userId: string, clinicId: string, page?: number, limit?: number): Promise<PaginatedResult<Notification>>;
  findAll(clinicId: string, page?: number, limit?: number, filters?: { isRead?: boolean, type?: string, channel?: string }): Promise<PaginatedResult<Notification>>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(clinicId: string): Promise<void>;
  getUnreadCount(clinicId: string): Promise<number>;
}

export class MockNotificationRepository implements INotificationRepository {
  private notifications: Notification[] = [];

  async create(data: Partial<Notification>): Promise<Notification> {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId: data.userId || 'unknown',
      clinicId: data.clinicId || 'default-clinic-id',
      appointmentId: data.appointmentId,
      channel: data.channel || 'email',
      type: data.type || 'booking_created',
      message: data.message || '',
      status: 'pending',
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.push(newNotif);
    return newNotif;
  }

  async update(id: string, data: Partial<Notification>): Promise<Notification> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Notification not found');
    this.notifications[index] = { ...this.notifications[index], ...data };
    return this.notifications[index];
  }

  async findByUserId(userId: string, clinicId: string, page = 1, limit = 10): Promise<PaginatedResult<Notification>> {
    let filtered = this.notifications.filter(n => n.userId === userId && n.clinicId === clinicId);
    
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

  async findAll(clinicId: string, page = 1, limit = 10, filters?: { isRead?: boolean, type?: string, channel?: string }): Promise<PaginatedResult<Notification>> {
    let filtered = this.notifications.filter(n => n.clinicId === clinicId);
    
    if (filters) {
      if (filters.isRead !== undefined) {
        filtered = filtered.filter(n => n.isRead === filters.isRead);
      }
      if (filters.type) {
        filtered = filtered.filter(n => n.type === filters.type);
      }
      if (filters.channel) {
        filtered = filtered.filter(n => n.channel === filters.channel);
      }
    }

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

  async markAsRead(id: string): Promise<void> {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      notif.readAt = new Date();
    }
  }

  async markAllAsRead(clinicId: string): Promise<void> {
    this.notifications.forEach(n => {
      if (n.clinicId === clinicId) {
        n.isRead = true;
        n.readAt = new Date();
      }
    });
  }

  async getUnreadCount(clinicId: string): Promise<number> {
    return this.notifications.filter(n => n.clinicId === clinicId && !n.isRead).length;
  }
}
