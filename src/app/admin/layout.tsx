import { Sidebar } from '@/components/Sidebar';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { checkRole } from '@/lib/guards';
import { ROLES } from '@/lib/constants';
import { resolveActiveClinic } from '@/lib/clinic-resolver';
import { NotificationProvider } from '@/providers/NotificationProvider';


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

  const activeClinic = await resolveActiveClinic();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <NotificationProvider>
        <Sidebar user={session} clinic={activeClinic as any} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 w-full max-w-7xl mx-auto py-12 px-6 lg:px-12 font-sans overflow-x-hidden">
            <Breadcrumbs />
            {children}
          </main>
        </div>
      </NotificationProvider>
    </div>
  );
}
