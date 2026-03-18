import { redirect } from 'next/navigation';
import { resolveActiveClinic } from '@/lib/clinic-resolver';
import { registry } from '@/lib/registry';
import ClinicSettingsForm from '@/modules/settings/components/ClinicSettingsForm';

export default async function AdminSettingsPage() {
  const activeClinic = await resolveActiveClinic();
  
  if (!activeClinic) {
    redirect('/admin/select-clinic');
  }

  // Fetch full clinic details, business hours, and all blocked slots
  const [clinic, businessHours, blockedSlots] = await Promise.all([
    registry.clinicRepo.findById(activeClinic.id),
    registry.bookingRepo.getBusinessHours(activeClinic.id),
    registry.bookingRepo.getAllBlockedSlots(activeClinic.id)
  ]);

  if (!clinic) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-display font-black text-foreground">Clinic Registry Error</h2>
        <p className="text-foreground-muted mt-2">Could not locate the operational record for this clinic.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl pb-20">
      <div className="mb-12 animate-in fade-in slide-in-from-left-4 duration-1000">
        <h1 className="text-5xl font-display font-black text-foreground tracking-tighter mb-2">Clinical Protocol</h1>
        <p className="text-[13px] font-black text-accent uppercase tracking-[0.3em]">Operational Configuration & Branding</p>
      </div>

      <ClinicSettingsForm 
        clinic={clinic as any} 
        businessHours={businessHours}
        blockedSlots={blockedSlots}
      />
    </div>
  );
}
