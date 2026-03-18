import { INotificationRepository } from './repository';

export interface Notification {
  id: string;
  userId: string;
  appointmentId?: string | null;
  channel: 'email' | 'line';
  type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'reminder';
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date | null;
  createdAt: Date;
}

export class NotificationService {
  constructor(private notificationRepo: INotificationRepository) {}

  async send(data: Partial<Notification>) {
    console.log(`[Notification] Sending ${data.type} to user ${data.userId} via ${data.channel}: ${data.message}`);
    
    // Save to DB via repository
    await this.notificationRepo.create(data);
    
    // Mock send
    return { success: true };
  }
}
