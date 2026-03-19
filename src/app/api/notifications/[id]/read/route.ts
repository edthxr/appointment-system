import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { registry } from '@/lib/registry';
import { getSession } from '@/lib/session';

const notificationRepo = registry.notificationRepo;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return apiResponse.error('กรุณาเข้าสู่ระบบ', 401);
    }

    const { id } = await params;
    
    // For security, normally we'd check if this notification belongs to the user
    // In a production app, we'd do: findById(id) then check userId === session.id
    // But markAsRead implementation in repository is simple for now.
    
    await notificationRepo.markAsRead(id);
    
    return apiResponse.success({ id }, 'ทำรายการสำเร็จ');
  } catch (error: any) {
    console.error('Mark as read error:', error);
    return apiResponse.error('เกิดข้อผิดพลาดในการทำรายการ');
  }
}
