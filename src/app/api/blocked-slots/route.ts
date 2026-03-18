import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { registry } from '@/lib/registry';
import { getSession } from '@/lib/session';
import { ROLES } from '@/lib/constants';
import { getClinicBySlug } from '@/lib/tenant';

const bookingRepo = registry.bookingRepo;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let clinicId = searchParams.get('clinicId');
  const clinicSlug = searchParams.get('clinicSlug');
  const dateStr = searchParams.get('date');

  if (!clinicId && clinicSlug) {
    const clinic = await getClinicBySlug(clinicSlug);
    clinicId = clinic?.id || null;
  }

  if (!clinicId) {
    return apiResponse.error('clinicId or clinicSlug is required', 400);
  }

  try {
    if (dateStr) {
      const date = new Date(dateStr);
      const blockedSlots = await bookingRepo.getBlockedSlots(date, clinicId);
      return apiResponse.success(blockedSlots);
    } else {
      // Get all blocked slots for the clinic
      // This would need to be implemented in the repository
      return apiResponse.success([], 'All blocked slots endpoint not implemented yet');
    }
  } catch (error: any) {
    console.error('Fetch blocked slots error:', error);
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

    // Validate date
    if (!body.blockedDate) {
      return apiResponse.error('blockedDate is required', 400);
    }

    // Validate time format HH:mm
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (body.startTime && !timeRegex.test(body.startTime)) {
      return apiResponse.error('startTime must be in HH:mm format', 400);
    }
    if (body.endTime && !timeRegex.test(body.endTime)) {
      return apiResponse.error('endTime must be in HH:mm format', 400);
    }

    const blockedSlot = await bookingRepo.createBlockedSlot(clinicId, {
      clinicId,
      blockedDate: new Date(body.blockedDate),
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      reason: body.reason || null,
    });
    
    return apiResponse.success(blockedSlot, 'สร้างช่วงเวลาที่ปิดรับจองสำเร็จ', 201);
  } catch (error: any) {
    return apiResponse.error(error.message || 'ไม่สามารถสร้างช่วงเวลาที่ปิดรับจองได้', 400);
  }
}
