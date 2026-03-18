import { NextResponse } from 'next/server';
import { resolveActiveClinic } from '@/lib/clinic-resolver';
import { db } from '@/db/client';
import { users, clinicUsers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const activeClinic = await resolveActiveClinic();
    if (!activeClinic) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ success: false, error: 'Role is required' }, { status: 400 });
    }

    await db!.update(users).set({ role }).where(eq(users.id, params.id));
    
    await db!.update(clinicUsers).set({ role }).where(
      and(eq(clinicUsers.userId, params.id), eq(clinicUsers.clinicId, activeClinic.id))
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const activeClinic = await resolveActiveClinic();
    if (!activeClinic) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await db!.delete(clinicUsers).where(
      and(eq(clinicUsers.userId, params.id), eq(clinicUsers.clinicId, activeClinic.id))
    );

    await db!.update(users).set({ role: 'user' }).where(eq(users.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
