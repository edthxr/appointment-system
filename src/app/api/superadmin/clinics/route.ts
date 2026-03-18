import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { clinics, appointments, services } from '@/db/schema';
import { checkRole } from '@/lib/guards';
import { ROLES } from '@/lib/constants';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await checkRole([ROLES.SUPER_ADMIN] as any);
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const allClinics = await db!.select().from(clinics).orderBy(desc(clinics.createdAt));

    const clinicsWithStats = await Promise.all(allClinics.map(async (clinic) => {
      const apps = await db!.select({ price: services.price, status: appointments.status })
        .from(appointments)
        .innerJoin(services, eq(appointments.serviceId, services.id))
        .where(eq(appointments.clinicId, clinic.id));

      let revenue = 0;
      let apptCount = apps.length;
      for (const t of apps) {
         if (t.status === 'completed' || t.status === 'confirmed') {
             revenue += parseFloat(t.price as any || 0);
         }
      }

      return {
        ...clinic,
        totalAppointments: apptCount,
        revenue,
      };
    }));

    return NextResponse.json({ success: true, data: clinicsWithStats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await checkRole([ROLES.SUPER_ADMIN] as any);
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: 'Name and slug are required' }, { status: 400 });
    }

    const [newClinic] = await db!.insert(clinics).values({
      name,
      slug,
      isActive: true,
      themeConfig: JSON.stringify({ primary: '#CCA75A' })
    }).returning();

    return NextResponse.json({ success: true, data: { ...newClinic, totalAppointments: 0, revenue: 0 } });
  } catch (error: any) {
    if (error.code === '23505') {
       return NextResponse.json({ success: false, error: 'Clinic slug already in use' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
