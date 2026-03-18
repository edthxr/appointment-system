import { redirect } from 'next/navigation';
import { resolveActiveClinic, getUserClinics } from '@/lib/clinic-resolver';
import { getSession } from '@/lib/session';

/**
 * Admin Calendar Redirect Page
 * 
 * Thin redirect layer - no calendar logic duplication.
 * Resolves user's active clinic and redirects to clinic-specific calendar.
 * 
 * Clinic Resolution Priority:
 * 1. User's primary clinic (owner/admin > staff > customer)
 * 2. Super admin -> first active clinic
 * 3. Multiple clinics -> /admin/select-clinic
 * 4. No clinics -> error page
 */
export default async function AdminCalendarRedirectPage() {
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
      // User has no clinic access
      redirect('/admin/dashboard?error=no_clinic_access');
    }
    
    // Multiple clinics - let user choose
    redirect('/admin/select-clinic');
  }

  // Single clinic resolved - redirect to clinic calendar
  redirect(`/c/${activeClinic.slug}/admin/calendar`);
}
