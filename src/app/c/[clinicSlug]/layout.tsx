import { Navbar } from '@/components/Navbar';
import { getSession } from '@/lib/session';
import { getClinicBySlug } from '@/lib/tenant';
import { notFound } from 'next/navigation';
import { CustomerNotificationProvider } from '@/providers/CustomerNotificationProvider';

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await params;
  const clinic = await getClinicBySlug(clinicSlug);

  if (!clinic) {
    notFound();
  }

  const session = await getSession();

  return (
    <CustomerNotificationProvider clinicSlug={clinicSlug}>
      <div className="min-h-screen bg-background">
        <Navbar clinic={clinic} user={session} />
        <div className="flex">
          <main className="flex-1 max-w-7xl mx-auto py-12 px-6 lg:px-12">
            {children}
          </main>
        </div>
      </div>
    </CustomerNotificationProvider>
  );
}
