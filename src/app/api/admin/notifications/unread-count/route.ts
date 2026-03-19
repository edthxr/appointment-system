import { NextResponse } from 'next/server';
import { registry } from '@/lib/registry';
import { resolveActiveClinic } from '@/lib/clinic-resolver';

export async function GET() {
  const activeClinic = await resolveActiveClinic();
  if (!activeClinic) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const notificationRepo = registry.notificationRepo;
    const count = await notificationRepo.getUnreadCount(activeClinic.id);

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error('Error getting unread count:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
