import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api-response';
import { registry } from '@/lib/registry';
import { getSession } from '@/lib/session';
import { ROLES } from '@/lib/constants';
import { getClinicBySlug } from '@/lib/tenant';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { Appointment } from '@/modules/bookings/types';

interface CalendarDay {
  date: string;
  appointments: Appointment[];
}

const bookingRepo = registry.bookingRepo;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let clinicId = searchParams.get('clinicId');
  const clinicSlug = searchParams.get('clinicSlug');
  const dateStr = searchParams.get('date');
  const view = searchParams.get('view') || 'month'; // month, week, day

  if (!clinicId && clinicSlug) {
    const clinic = await getClinicBySlug(clinicSlug);
    clinicId = clinic?.id || null;
  }

  if (!clinicId) {
    return apiResponse.error('clinicId or clinicSlug is required', 400);
  }

  if (!dateStr) {
    return apiResponse.error('date is required', 400);
  }

  try {
    const session = await getSession();
    const isAdmin = session && [
      ROLES.SUPER_ADMIN, 
      ROLES.CLINIC_OWNER, 
      ROLES.CLINIC_ADMIN, 
      ROLES.CLINIC_STAFF
    ].includes(session.role as any);

    const date = new Date(dateStr);
    let appointments: CalendarDay[] | Appointment[] = [];

    if (view === 'month') {
      // Get all appointments for the month
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

      const monthAppointments: CalendarDay[] = [];
      for (const day of daysInMonth) {
        const dayAppointments = await bookingRepo.getAppointmentsByDate(day, clinicId);
        
        // Filter based on user role
        const filteredAppointments = isAdmin 
          ? dayAppointments 
          : session 
            ? dayAppointments.filter(apt => apt.userId === session.id)
            : [];

        monthAppointments.push({
          date: format(day, 'yyyy-MM-dd'),
          appointments: filteredAppointments
        });
      }
      appointments = monthAppointments;
    } else if (view === 'week' || view === 'day') {
      appointments = await bookingRepo.getAppointmentsByDate(date, clinicId);
      
      // Filter based on user role
      appointments = isAdmin 
        ? appointments 
        : session 
          ? appointments.filter(apt => apt.userId === session.id)
          : [];
    }

    // Get business hours for context
    const businessHours = await bookingRepo.getBusinessHours(clinicId);

    return apiResponse.success({
      view,
      date: dateStr,
      appointments,
      businessHours,
      isAdmin,
    });
  } catch (error: any) {
    console.error('Calendar fetch error:', error);
    return apiResponse.error('เกิดข้อผิดพลาดในการดึงข้อมูลปฏิทิน');
  }
}
