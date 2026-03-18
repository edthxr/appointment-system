import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { registry } from '@/lib/registry';
import { checkAuth } from '@/lib/guards';

import { getClinicBySlug } from '@/lib/tenant';

const bookingRepo = registry.bookingRepo;

export async function GET(req: NextRequest) {
  const session = await checkAuth();
  const { searchParams } = new URL(req.url);
  const clinicSlug = searchParams.get('clinicSlug');

  if (!clinicSlug) {
    return apiResponse.error('clinicSlug is required', 400);
  }

  const clinic = await getClinicBySlug(clinicSlug);
  if (!clinic) {
    return apiResponse.error('Clinic not found', 404);
  }

  try {
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || undefined;
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

    if (session.role === 'admin' || session.role === 'super_admin') {
      const result = await bookingRepo.findAll(clinic.id, page, limit, search, sortBy, sortOrder);
      return apiResponse.success(result.data, undefined, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } else {
      const result = await bookingRepo.findByUserId(session.id, clinic.id, page, limit, search, sortBy, sortOrder);
      return apiResponse.success(result.data, undefined, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    }
  } catch (error: any) {
    console.error('Fetch appointments error:', error);
    return apiResponse.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
  }
}
