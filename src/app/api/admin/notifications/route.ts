import { NextResponse } from 'next/server';
import { registry } from '@/lib/registry';
import { resolveActiveClinic } from '@/lib/clinic-resolver';

export async function GET(request: Request) {
  const activeClinic = await resolveActiveClinic();
  if (!activeClinic) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check role from resolved clinic
  if (activeClinic.role === 'customer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  const isRead = searchParams.get('isRead');
  const type = searchParams.get('type');
  const channel = searchParams.get('channel');
  
  const filters: any = {};
  if (isRead !== null) filters.isRead = isRead === 'true';
  if (type) filters.type = type;
  if (channel) filters.channel = channel;

  try {
    const notificationRepo = registry.notificationRepo;
    const [result, unreadCount] = await Promise.all([
      notificationRepo.findAll(activeClinic.id, page, limit, filters),
      notificationRepo.getUnreadCount(activeClinic.id)
    ]);

    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        unreadCount
      }
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
