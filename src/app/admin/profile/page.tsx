import { getSession } from '@/lib/session';
import { registry } from '@/lib/registry';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/modules/auth/components/ProfileForm';

export default async function AdminProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect('/auth/login');
  }

  const user = await registry.userRepo.findById(session.id);
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="mb-12">
        <h1 className="text-5xl font-display font-black text-foreground tracking-tighter mb-2">Personal Identity</h1>
        <p className="text-[13px] font-black text-accent uppercase tracking-[0.3em]">{user.name} Management Profile</p>
      </div>

      <ProfileForm user={user} />
      
      <div className="mt-12 text-center">
         <p className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] opacity-40">
           Last profile synchronization: {new Date().toLocaleDateString('th-TH')}
         </p>
      </div>
    </div>
  );
}
