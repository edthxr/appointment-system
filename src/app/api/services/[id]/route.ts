import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { registry } from '@/lib/registry';
import { ServiceService } from '@/modules/services/service';
import { getSession } from '@/lib/session';

const serviceService = new ServiceService(registry.serviceRepo);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return apiResponse.error('ไม่มีสิทธิ์เข้าถึง', 403);
    }

    const body = await req.json();
    const service = await serviceService.updateService(params.id, body);
    return apiResponse.success(service, 'อัปเดตบริการสำเร็จ');
  } catch (error: any) {
    return apiResponse.error(error.message || 'ไม่สามารถอัปเดตบริการได้', 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return apiResponse.error('ไม่มีสิทธิ์เข้าถึง', 403);
    }

    await serviceService.deleteService(params.id);
    return apiResponse.success(null, 'ลบบริการสำเร็จ');
  } catch (error: any) {
    return apiResponse.error(error.message || 'ไม่สามารถลบบริการได้', 400);
  }
}
