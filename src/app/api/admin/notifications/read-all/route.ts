import { NextResponse } from 'next/server';
import { registry } from '@/lib/registry';
import { resolveActiveClinic } from '@/lib/clinic-resolver';

export async function PATCH() {
  const activeClinic = await resolveActiveClinic();
  if (!activeClinic) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const notificationRepo = registry.notificationRepo;
    await notificationRepo.markAllAsRead(activeClinic.id);

    return NextResponse.json({ success: true, count: 0 });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
