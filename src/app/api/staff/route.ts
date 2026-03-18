import { NextResponse } from 'next/server';
import { registry } from '@/lib/registry';
import { resolveActiveClinic } from '@/lib/clinic-resolver';
import { db } from '@/db/client';
import { users, clinicUsers } from '@/db/schema';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  try {
    const activeClinic = await resolveActiveClinic();
    if (!activeClinic) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const staff = await registry.userRepo.findStaffByClinicId(activeClinic.id);
    return NextResponse.json({ success: true, data: staff });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const activeClinic = await resolveActiveClinic();
    if (!activeClinic) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, email, phone, role, password } = body;

    if (!name || !email || !role || !password) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db!.insert(users).values({
      name,
      email,
      phone,
      passwordHash,
      role: role as 'clinic_owner' | 'clinic_admin' | 'clinic_staff',
    }).returning();

    await db!.insert(clinicUsers).values({
      clinicId: activeClinic.id,
      userId: newUser.id,
      role: role as 'clinic_owner' | 'clinic_admin' | 'clinic_staff',
    });

    return NextResponse.json({ success: true, data: newUser });
  } catch (error: any) {
    if (error.code === '23505') { 
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
