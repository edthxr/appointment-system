import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { clinics } from '@/db/schema';
import { checkRole } from '@/lib/guards';
import { ROLES } from '@/lib/constants';
import { eq } from 'drizzle-orm';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await checkRole([ROLES.SUPER_ADMIN] as any);
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, error: 'isActive must be a boolean' }, { status: 400 });
    }

    await db!.update(clinics).set({ isActive, updatedAt: new Date() }).where(eq(clinics.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
