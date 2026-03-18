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
  clinicId: string;
}

import { INotificationProvider } from './provider';

export class NotificationService {
  private providers: INotificationProvider[] = [];

  constructor(private notificationRepo: INotificationRepository) {}

  registerProvider(provider: INotificationProvider) {
    this.providers.push(provider);
  }

  async send(data: Partial<Notification> & { to?: string }) {
    const provider = this.providers.find(p => p.channel === data.channel);
    
    // 1. Create entry in DB as pending
    const notif = await this.notificationRepo.create({
      ...data,
      status: 'pending'
    });

    if (!provider) {
      console.warn(`[Notification] No provider registered for channel: ${data.channel}`);
      return { success: false, error: 'Provider not found' };
    }

    try {
      // 2. Actually send
      const result = await provider.send({
        to: data.to || 'unknown',
        subject: this.getSubjectForType(data.type!),
        message: data.message!
      });

      // 3. Update DB with result
      await this.notificationRepo.update(notif.id, {
        status: result.success ? 'sent' : 'failed',
        sentAt: result.success ? new Date() : null
      });

      return result;
    } catch (error: any) {
      await this.notificationRepo.update(notif.id, {
        status: 'failed'
      });
      return { success: false, error: error.message };
    }
  }

  private getSubjectForType(type: string) {
    const subjects: Record<string, string> = {
      booking_created: 'ยืนยันการจองนัดหมายใหม่',
      booking_confirmed: 'นัดหมายของคุณได้รับการยืนยันแล้ว',
      booking_cancelled: 'แจ้งยกเลิกนัดหมาย',
      reminder: 'แจ้งเตือนนัดหมายของคุณ'
    };
    return subjects[type] || 'Clinical Notification';
  }
}
