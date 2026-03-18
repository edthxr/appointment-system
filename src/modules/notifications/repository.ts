import { Notification } from './service';

export interface INotificationRepository {
  create(data: Partial<Notification>): Promise<Notification>;
  findByUserId(userId: string): Promise<Notification[]>;
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

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.notifications.filter(n => n.userId === userId);
  }
}
