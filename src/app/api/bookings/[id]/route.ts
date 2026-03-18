import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { BookingService } from '@/modules/bookings/service';
import { registry } from '@/lib/registry';
import { getSession } from '@/lib/session';

const bookingService = new BookingService(registry.bookingRepo, registry.serviceRepo);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return apiResponse.error('กรุณาเข้าสู่ระบบ', 401);
    }

    const body = await req.json();
    const { status } = body;

    const updated = await bookingService.updateStatus(
      params.id,
      status,
      session.id,
      session.role === 'admin'
    );

    return apiResponse.success(updated, 'อัปเดตสถานะสำเร็จ');
  } catch (error: any) {
    return apiResponse.error(error.message || 'ไม่สามารถอัปเดตสถานะได้', 400);
  }
}
