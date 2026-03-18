import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { registry } from '@/lib/registry';
import { ServiceService } from '@/modules/services/service';
import { getSession } from '@/lib/session';
import { ROLES } from '@/lib/constants';

import { getClinicBySlug } from '@/lib/tenant';

const serviceService = new ServiceService(registry.serviceRepo);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let clinicId = searchParams.get('clinicId');
  const clinicSlug = searchParams.get('clinicSlug');

  if (!clinicId && clinicSlug) {
    const clinic = await getClinicBySlug(clinicSlug);
    clinicId = clinic?.id || null;
  }

  if (!clinicId) {
    return apiResponse.error('clinicId or clinicSlug is required', 400);
  }

  try {
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || undefined;
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

    const result = await serviceService.getAllServices(clinicId, page, limit, search, sortBy, sortOrder);
    return apiResponse.success(result.data, undefined, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error: any) {
    console.error('Fetch services error:', error);
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
      ROLES.ADMIN
    ].includes(session.role as any);

    if (!canManage) {
      return apiResponse.error('ไม่มีสิทธิ์เข้าถึง', 403);
    }

    const body = await req.json();
    const service = await serviceService.createService(body);
    return apiResponse.success(service, 'เพิ่มบริการสำเร็จ', 201);
  } catch (error: any) {
    return apiResponse.error(error.message || 'ไม่สามารถเพิ่มบริการได้', 400);
  }
}
