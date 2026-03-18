import { Navbar } from '@/components/Navbar';
import { getSession } from '@/lib/session';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-background">
      <Navbar role="admin" />
      <div className="flex">
        <main className="flex-1 max-w-7xl mx-auto py-12 px-6 lg:px-12">
        {children}
      </main>
    </div>
    </div>
  );
}
