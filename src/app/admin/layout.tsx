import { Navbar } from '@/components/Navbar';
import { checkRole } from '@/lib/guards';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkRole(['admin']);

  return (
    <div className="min-h-screen bg-background">
      <Navbar role="admin" />
      <div className="flex">
        <main className="flex-1 max-w-7xl mx-auto py-12 px-6 lg:px-12 font-sans">
          {children}
        </main>
      </div>
    </div>
  );
}
