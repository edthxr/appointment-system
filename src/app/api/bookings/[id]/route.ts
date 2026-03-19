import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { BookingService } from '@/modules/bookings/service';
import { registry } from '@/lib/registry';
import { getSession } from '@/lib/session';
import { ROLES } from '@/lib/constants';
import { logPlatformActivity } from '@/lib/audit-logger';

import { getClinicBySlug } from '@/lib/tenant';

const bookingService = registry.bookingService;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return apiResponse.error('กรุณาเข้าสู่ระบบ', 401);
    }

    const { searchParams } = new URL(req.url);
    const clinicSlug = searchParams.get('clinicSlug');

    if (!clinicSlug) {
      return apiResponse.error('clinicSlug is required', 400);
    }

    const clinic = await getClinicBySlug(clinicSlug);
    if (!clinic) {
      return apiResponse.error('Clinic not found', 404);
    }

    const body = await req.json();
    const { status } = body;
 
    const updated = await bookingService.updateStatus(
      id,
      clinic.id,
      status,
      session.id,
      [
        ROLES.SUPER_ADMIN, 
        ROLES.CLINIC_OWNER, 
        ROLES.CLINIC_ADMIN, 
        ROLES.CLINIC_STAFF, 
        ROLES.ADMIN
      ].includes(session.role as any)
    );

    await logPlatformActivity({
      eventType: 'booking_updated',
      actorUserId: session.id,
      actorRole: session.role,
      clinicId: clinic.id,
      entityType: 'booking',
      entityId: id,
      action: 'update',
      summary: `Updated booking status to ${status}`,
    });

    return apiResponse.success(updated, 'อัปเดตสถานะสำเร็จ');
  } catch (error: any) {
    return apiResponse.error(error.message || 'ไม่สามารถอัปเดตสถานะได้', 400);
  }
}
