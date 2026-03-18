import { redirect } from 'next/navigation';
import { resolveActiveClinic, getUserClinics } from '@/lib/clinic-resolver';
import { getSession } from '@/lib/session';
import AdminCalendarView from '@/modules/calendar/components/AdminCalendarView';

export default async function AdminCalendarPage() {
  const session = await getSession();

  // Not logged in
  if (!session) {
    redirect('/login');
  }

  // Resolve active clinic for user
  const activeClinic = await resolveActiveClinic();

  // No clinic access - check if user has any clinics
  if (!activeClinic) {
    const userClinics = await getUserClinics();
    
    if (userClinics.length === 0) {
      redirect('/admin/dashboard?error=no_clinic_access');
    }
    
    redirect('/admin/select-clinic');
  }

  // Render the calendar directly at /admin/calendar
  return (
    <AdminCalendarView 
      clinicSlug={activeClinic.slug} 
      clinicName={activeClinic.name} 
    />
  );
}
