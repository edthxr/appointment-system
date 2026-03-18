import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { registry } from '@/lib/registry';
import { BookingService } from '@/modules/bookings/service';
import { getSession } from '@/lib/session';

const bookingService = new BookingService(registry.bookingRepo, registry.serviceRepo);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get('date');
  const serviceId = searchParams.get('serviceId');

  if (!dateStr || !serviceId) {
    return apiResponse.error('กรุณาระบุวันที่และบริการ');
  }

  try {
    const slots = await bookingService.getAvailableSlots(new Date(dateStr), serviceId);
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
    const result = await bookingService.createBooking({
      ...body,
      userId: session.id,
      appointmentDate: new Date(body.appointmentDate),
    });
    return apiResponse.success(result, 'จองคิวสำเร็จ', 201);
  } catch (error: any) {
    return apiResponse.error(error.message);
  }
}
