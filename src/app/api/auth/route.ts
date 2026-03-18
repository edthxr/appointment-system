import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AuthService } from '@/modules/auth/service';
import { registry } from '@/lib/registry';

import { getSession } from '@/lib/session';

const authService = new AuthService(registry.userRepo);

export async function GET() {
  const session = await getSession();
  if (!session) {
    return apiResponse.error('Not authenticated', 401);
  }
  return apiResponse.success(session);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await authService.login(body);
    return apiResponse.success(user, 'เข้าสู่ระบบสำเร็จ');
  } catch (error: any) {
    return apiResponse.error(error.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401);
  }
}

export async function DELETE() {
  await authService.logout();
  return apiResponse.success(null, 'ออกจากระบบแล้ว');
}
