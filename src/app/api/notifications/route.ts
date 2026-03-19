import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { registry } from '@/lib/registry';
import { getSession } from '@/lib/session';
import { ROLES } from '@/lib/constants';
import { getClinicBySlug } from '@/lib/tenant';

const notificationRepo = registry.notificationRepo;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let clinicId = searchParams.get('clinicId');
  const clinicSlug = searchParams.get('clinicSlug');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!clinicId && clinicSlug) {
    const clinic = await getClinicBySlug(clinicSlug);
    clinicId = clinic?.id || null;
  }

  if (!clinicId) {
    return apiResponse.error('clinicId or clinicSlug is required', 400);
  }

  try {
    const session = await getSession();
    if (!session) {
      return apiResponse.error('กรุณาเข้าสู่ระบบ', 401);
    }

    const filters: any = {};
    const isReadParam = searchParams.get('isRead');
    if (isReadParam !== null) {
      filters.isRead = isReadParam === 'true';
    }

    const [notifications, unreadCount] = await Promise.all([
      notificationRepo.findByUserId(session.id, clinicId, page, limit, filters),
      notificationRepo.getUnreadCount(clinicId, session.id)
    ]);

    return apiResponse.success(notifications.data, undefined, 200, {
      total: notifications.total,
      page: notifications.page,
      limit: notifications.limit,
      totalPages: notifications.totalPages,
      unreadCount
    });
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    return apiResponse.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const canManage = session && [
      ROLES.SUPER_ADMIN, 
      ROLES.CLINIC_OWNER, 
      ROLES.CLINIC_ADMIN, 
      ROLES.CLINIC_STAFF
    ].includes(session.role as any);

    if (!canManage) {
      return apiResponse.error('ไม่มีสิทธิ์เข้าถึง', 403);
    }

    const body = await req.json();
    let { clinicId, clinicSlug } = body;

    if (!clinicId && clinicSlug) {
      const clinic = await getClinicBySlug(clinicSlug);
      clinicId = clinic?.id;
    }

    if (!clinicId) {
      return apiResponse.error('clinicId or clinicSlug is required');
    }

    // Validate required fields
    if (!body.userId || !body.channel || !body.type || !body.message) {
      return apiResponse.error('userId, channel, type, and message are required', 400);
    }

    const notification = await notificationRepo.create({
      ...body,
      clinicId,
      status: 'pending',
    });
    
    return apiResponse.success(notification, 'สร้างการแจ้งเตือนสำเร็จ', 201);
  } catch (error: any) {
    return apiResponse.error(error.message || 'ไม่สามารถสร้างการแจ้งเตือนได้', 400);
  }
}
