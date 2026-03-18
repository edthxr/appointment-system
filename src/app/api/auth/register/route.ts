import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { AuthService } from '@/modules/auth/service';
import { registry } from '@/lib/registry';
import { registerSchema } from '@/modules/auth/validations';

const authService = new AuthService(registry.userRepo);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return apiResponse.error(validation.error.issues[0].message, 400);
    }

    const user = await authService.register(validation.data);
    return apiResponse.success(user, 'ลงทะเบียนสำเร็จ');
  } catch (error: any) {
    return apiResponse.error(error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน', 500);
  }
}
