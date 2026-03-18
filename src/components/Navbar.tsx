'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils'; // I'll create this helper in src/lib/utils.ts

export function Navbar({ role }: { role?: 'admin' | 'user' | null }) {
  const pathname = usePathname();

  const publicLinks = [
    { href: '/', label: 'หน้าแรก' },
    { href: '/services', label: 'บริการของเรา' },
    { href: '/booking', label: 'จองคิว' },
  ];

  const userLinks = [
    ...publicLinks,
    { href: '/my-bookings', label: 'รายการจองของฉัน' },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/services', label: 'จัดการบริการ' },
    { href: '/admin/appointments', label: 'รายการนัดหมาย' },
    { href: '/admin/calendar', label: 'ปฏิทิน' },
    { href: '/admin/settings', label: 'ตั้งค่า' },
  ];

  const links = role === 'admin' ? adminLinks : role === 'user' ? userLinks : publicLinks;

  return (
    <nav className="glass-ios border-b border-border-ios sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <span className="text-2xl font-display font-black tracking-tighter text-foreground group-hover:text-accent transition-colors">
                Aura <span className="font-light text-foreground-muted">Clinic</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-[13px] font-bold uppercase tracking-widest transition-all duration-300",
                    pathname === link.href
                      ? "text-accent"
                      : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {role ? (
              <button 
                onClick={async () => {
                  await fetch('/api/auth', { method: 'DELETE' });
                  window.location.href = '/';
                }}
                className="px-6 py-2.5 bg-foreground text-white rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-foreground/80 transition-all shadow-md active:scale-95"
              >
                ออกจากระบบ
              </button>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2.5 bg-foreground text-white rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-foreground/80 transition-all shadow-md active:scale-95"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
