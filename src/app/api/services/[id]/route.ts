import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { registry } from '@/lib/registry';
import { ServiceService } from '@/modules/services/service';
import { getSession } from '@/lib/session';
import { ROLES } from '@/lib/constants';
import { getClinicBySlug } from '@/lib/tenant';
import { logPlatformActivity } from '@/lib/audit-logger';

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

    await logPlatformActivity({
      eventType: 'service_updated',
      actorUserId: session.id,
      actorRole: session.role,
      clinicId: clinicId,
      entityType: 'service',
      entityId: id,
      action: 'update',
      summary: `Updated service: ${service.name}`,
    });

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

    await logPlatformActivity({
      eventType: 'service_deleted',
      actorUserId: session.id,
      actorRole: session.role,
      clinicId: clinicId,
      entityType: 'service',
      entityId: id,
      action: 'delete',
      summary: `Deleted service`,
    });

    return apiResponse.success(null, 'ลบบริการสำเร็จ', 200);
  } catch (error: any) {
    return apiResponse.error(error.message || 'ไม่สามารถลบบริการได้', 400);
  }
}
