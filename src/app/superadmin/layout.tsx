import { SuperAdminNavbar } from '@/components/SuperAdminNavbar';
import { checkRole } from '@/lib/guards';
import { ROLES } from '@/lib/constants';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await checkRole([ROLES.SUPER_ADMIN] as any);

  return (
    <div className="min-h-screen bg-background">
      <SuperAdminNavbar user={session} />
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {children}
      </main>
    </div>
  );
}
