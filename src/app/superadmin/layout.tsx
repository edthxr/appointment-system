import { Sidebar } from '@/components/Sidebar';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { checkRole } from '@/lib/guards';
import { ROLES } from '@/lib/constants';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await checkRole([ROLES.SUPER_ADMIN] as any);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar user={session} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-7xl mx-auto py-12 px-6 lg:px-12 font-sans overflow-x-hidden">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
