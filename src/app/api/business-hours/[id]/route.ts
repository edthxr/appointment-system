import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { registry } from '@/lib/registry';
import { getSession } from '@/lib/session';
import { ROLES } from '@/lib/constants';
import { getClinicBySlug } from '@/lib/tenant';

const bookingRepo = registry.bookingRepo;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { searchParams } = new URL(req.url);
    let clinicId = searchParams.get('clinicId');
    const clinicSlug = searchParams.get('clinicSlug');

    if (!clinicId && clinicSlug) {
      const clinic = await getClinicBySlug(clinicSlug);
      clinicId = clinic?.id ?? null;
    }

    if (!clinicId) {
      return apiResponse.error('clinicId or clinicSlug is required');
    }

    const body = await req.json();
    
    // Validate dayOfWeek 0-6
    if (body.dayOfWeek !== undefined && (body.dayOfWeek < 0 || body.dayOfWeek > 6)) {
      return apiResponse.error('dayOfWeek must be between 0-6', 400);
    }

    // Validate time format HH:mm
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (body.startTime && !timeRegex.test(body.startTime)) {
      return apiResponse.error('startTime must be in HH:mm format', 400);
    }
    if (body.endTime && !timeRegex.test(body.endTime)) {
      return apiResponse.error('endTime must be in HH:mm format', 400);
    }

    const businessHours = await bookingRepo.updateBusinessHours(params.id, clinicId, body);
    return apiResponse.success(businessHours, 'อัปเดตเวลาทำการสำเร็จ');
  } catch (error: any) {
    return apiResponse.error(error.message || 'ไม่สามารถอัปเดตเวลาทำการได้', 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { searchParams } = new URL(req.url);
    let clinicId = searchParams.get('clinicId');
    const clinicSlug = searchParams.get('clinicSlug');

    if (!clinicId && clinicSlug) {
      const clinic = await getClinicBySlug(clinicSlug);
      clinicId = clinic?.id ?? null;
    }

    if (!clinicId) {
      return apiResponse.error('clinicId or clinicSlug is required');
    }

    await bookingRepo.deleteBusinessHours(params.id, clinicId);
    return apiResponse.success(null, 'ลบเวลาทำการสำเร็จ');
  } catch (error: any) {
    return apiResponse.error(error.message || 'ไม่สามารถลบเวลาทำการได้', 400);
  }
}
