import { Notification } from './service';

export interface NotificationPayload {
  to: string;
  subject?: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface INotificationProvider {
  channel: 'email' | 'line';
  send(payload: NotificationPayload): Promise<{ success: boolean; error?: string; messageId?: string }>;
}
