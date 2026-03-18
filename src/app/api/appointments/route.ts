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

  if (session.role === 'admin' || session.role === 'super_admin') {
    const all = await bookingRepo.findAll(clinic.id);
    return apiResponse.success(all);
  } else {
    const mine = await bookingRepo.findByUserId(session.id, clinic.id);
    return apiResponse.success(mine);
  }
}
