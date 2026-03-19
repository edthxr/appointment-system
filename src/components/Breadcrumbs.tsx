'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);

  if (paths.length === 0) return null;

  const pathLabels: Record<string, string> = {
    'admin': 'Management',
    'superadmin': 'Platform',
    'dashboard': 'Overview',
    'clinics': 'Healthcare Centers',
    'services': 'Services',
    'bookings': 'Appointments',
    'profile': 'My Profile',
    'settings': 'Settings',
  };

  return (
    <nav className="flex items-center gap-2 mb-8 text-[11px] font-black uppercase tracking-widest text-foreground-muted/60">
      <Link href="/" className="hover:text-accent transition-colors">Home</Link>
      {paths.map((path, idx) => {
        const href = `/${paths.slice(0, idx + 1).join('/')}`;
        const isLast = idx === paths.length - 1;
        const rawLabel = path.replace(/-/g, ' ');
        const label = pathLabels[path.toLowerCase()] || rawLabel;

        return (
          <div key={idx} className="flex items-center gap-2">
            <span>/</span>
            {isLast ? (
              <span className="text-foreground tracking-widest">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
