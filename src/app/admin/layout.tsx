import { Navbar } from '@/components/Navbar';
import { checkRole } from '@/lib/guards';
import { ROLES } from '@/lib/constants';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await checkRole([
    ROLES.SUPER_ADMIN, 
    ROLES.CLINIC_OWNER, 
    ROLES.CLINIC_ADMIN, 
    ROLES.CLINIC_STAFF, 
    ROLES.ADMIN
  ] as any);

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session} />
      <div className="flex">
        <main className="flex-1 max-w-7xl mx-auto py-12 px-6 lg:px-12 font-sans">
          {children}
        </main>
      </div>
    </div>
  );
}
