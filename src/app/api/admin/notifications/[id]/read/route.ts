import { NextResponse } from 'next/server';
import { registry } from '@/lib/registry';
import { resolveActiveClinic } from '@/lib/clinic-resolver';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const activeClinic = await resolveActiveClinic();
  if (!activeClinic) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const notificationRepo = registry.notificationRepo;
    const affected = await notificationRepo.markAsRead(id, activeClinic.id);
    const count = await notificationRepo.getUnreadCount(activeClinic.id);

    return NextResponse.json({ success: true, count, affected });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
