import { INotificationProvider, NotificationPayload } from './provider';

export class MockEmailProvider implements INotificationProvider {
  channel: 'email' = 'email';

  async send(payload: NotificationPayload) {
    console.log(`[MockEmailProvider] Sending to ${payload.to}`);
    console.log(`[Subject] ${payload.subject || 'Clinical Alert'}`);
    console.log(`[Message] ${payload.message}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, messageId: `mock-email-${Math.random().toString(36).substr(2, 9)}` };
  }
}
