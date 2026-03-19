import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { registry } from '@/lib/registry';
import { getSession } from '@/lib/session';
import { getClinicBySlug } from '@/lib/tenant';

const notificationRepo = registry.notificationRepo;

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return apiResponse.error('กรุณาเข้าสู่ระบบ', 401);
    }

    const { searchParams } = new URL(req.url);
    const clinicSlug = searchParams.get('clinicSlug');
    let clinicId = searchParams.get('clinicId');

    if (!clinicId && clinicSlug) {
      const clinic = await getClinicBySlug(clinicSlug);
      clinicId = clinic?.id || null;
    }

    if (!clinicId) {
      return apiResponse.error('clinicId or clinicSlug is required');
    }

    await notificationRepo.markAllAsRead(clinicId, session.id);
    
    return apiResponse.success(null, 'อ่านการแจ้งเตือนทั้งหมดแล้ว');
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    return apiResponse.error('เกิดข้อผิดพลาดในการทำรายการ');
  }
}
