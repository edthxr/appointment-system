import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { platformAuditLogs } from '@/db/schema';
import { checkRole } from '@/lib/guards';
import { ROLES } from '@/lib/constants';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await checkRole([ROLES.SUPER_ADMIN] as any);
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const recentLogs = await db!.select()
      .from(platformAuditLogs)
      .orderBy(desc(platformAuditLogs.createdAt))
      .limit(20);

    return NextResponse.json({ success: true, data: recentLogs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
