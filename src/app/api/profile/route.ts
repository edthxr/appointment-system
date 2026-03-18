import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { registry } from '@/lib/registry';
import { getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return apiResponse.error('กรุณาเข้าสู่ระบบ', 401);
    }

    const body = await req.json();
    const { name, phone, currentPassword, newPassword } = body;

    // 1. Basic Profile Update
    if (name || phone) {
      await registry.userRepo.update(session.id, {
        name,
        phone,
      });
    }

    // 2. Password Update (Optional)
    if (newPassword) {
      if (!currentPassword) {
        return apiResponse.error('กรุณาระบุรหัสผ่านปัจจุบันเพื่อเปลี่ยนรหัสผ่านใหม่', 400);
      }

      const userWithPass = await registry.userRepo.findWithPasswordByEmail(session.email);
      if (!userWithPass) {
        return apiResponse.error('ไม่พบผู้ใช้งาน', 404);
      }

      const isMatch = await bcrypt.compare(currentPassword, userWithPass.passwordHash);
      if (!isMatch) {
        return apiResponse.error('รหัสผ่านปัจจุบันไม่ถูกต้อง', 400);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await registry.userRepo.updatePassword(session.id, hashedPassword);
    }

    return apiResponse.success(null, 'อัปเดตโปรไฟล์สำเร็จ');
  } catch (error: any) {
    return apiResponse.error(error.message || 'ไม่สามารถอัปเดตโปรไฟล์ได้', 400);
  }
}
