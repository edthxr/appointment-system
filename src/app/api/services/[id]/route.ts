import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { registry } from '@/lib/registry';
import { ServiceService } from '@/modules/services/service';
import { getSession } from '@/lib/session';
import { ROLES } from '@/lib/constants';
import { getClinicBySlug } from '@/lib/tenant';

const serviceService = new ServiceService(registry.serviceRepo);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await req.json();
    const service = await serviceService.updateService(id, clinicId, body);
    return apiResponse.success(service, 'อัปเดตบริการสำเร็จ', 200);
  } catch (error: any) {
    return apiResponse.error(error.message || 'ไม่สามารถอัปเดตบริการได้', 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    await serviceService.deleteService(id, clinicId);
    return apiResponse.success(null, 'ลบบริการสำเร็จ', 200);
  } catch (error: any) {
    return apiResponse.error(error.message || 'ไม่สามารถลบบริการได้', 400);
  }
}
