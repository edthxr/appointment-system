import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { registry } from '@/lib/registry';
import { BookingService } from '@/modules/bookings/service';
import { getSession } from '@/lib/session';

import { getClinicBySlug } from '@/lib/tenant';

const bookingService = registry.bookingService;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get('date');
  const serviceId = searchParams.get('serviceId');
  let clinicId = searchParams.get('clinicId');
  const clinicSlug = searchParams.get('clinicSlug');

  if (!dateStr || !serviceId) {
    return apiResponse.error('กรุณาระบุวันที่และบริการ');
  }

  if (!clinicId && clinicSlug) {
    const clinic = await getClinicBySlug(clinicSlug);
    clinicId = clinic?.id || null;
  }

  if (!clinicId) {
    return apiResponse.error('clinicId or clinicSlug is required');
  }

  try {
    const slots = await bookingService.getAvailableSlots(new Date(dateStr), serviceId, clinicId);
    return apiResponse.success(slots);
  } catch (error: any) {
    return apiResponse.error(error.message);
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return apiResponse.error('กรุณาเข้าสู่ระบบ', 401);

  try {
    const body = await req.json();
    let { clinicId, clinicSlug } = body;

    if (!clinicId && clinicSlug) {
      const clinic = await getClinicBySlug(clinicSlug);
      clinicId = clinic?.id;
    }

    if (!clinicId) {
      return apiResponse.error('clinicId or clinicSlug is required');
    }

    const result = await bookingService.createBooking({
      ...body,
      clinicId,
      userId: session.id,
      appointmentDate: new Date(body.appointmentDate),
    });
    return apiResponse.success(result, 'จองคิวสำเร็จ', 201);
  } catch (error: any) {
    return apiResponse.error(error.message);
  }
}
