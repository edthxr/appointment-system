import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { registry } from '@/lib/registry';
import { ServiceService } from '@/modules/services/service';
import { getSession } from '@/lib/session';

const serviceService = new ServiceService(registry.serviceRepo);

export async function GET() {
  const services = await serviceService.getAllServices();
  return apiResponse.success(services);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return apiResponse.error('ไม่มีสิทธิ์เข้าถึง', 403);
    }

    const body = await req.json();
    const service = await serviceService.createService(body);
    return apiResponse.success(service, 'เพิ่มบริการสำเร็จ', 201);
  } catch (error: any) {
    return apiResponse.error(error.message || 'ไม่สามารถเพิ่มบริการได้', 400);
  }
}
