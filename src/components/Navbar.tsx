'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils'; // I'll create this helper in src/lib/utils.ts

import { ROLES, Role } from '@/lib/constants';

export function Navbar({ 
  user,
  clinic 
}: { 
  user?: { name: string; role: Role } | null;
  clinic?: { name: string; slug: string };
}) {
  const pathname = usePathname();
  const role = user?.role;

  const clinicLabel = clinic?.name || 'Aura Clinic';
  const clinicSlug = clinic?.slug;

  type NavLink = {
    href: string;
    label: string;
    subLinks?: { href: string; label: string }[];
  };

  const publicLinks: NavLink[] = [
    { href: clinicSlug ? `/c/${clinicSlug}` : '/', label: 'หน้าแรก' },
    { href: clinicSlug ? `/c/${clinicSlug}/services` : '/services', label: 'บริการของเรา' },
    { href: clinicSlug ? `/c/${clinicSlug}/booking` : '/booking', label: 'จองคิว' },
  ];

  const userLinks: NavLink[] = [
    ...publicLinks,
    { href: clinicSlug ? `/c/${clinicSlug}/my-bookings` : '/my-bookings', label: 'รายการจองของฉัน' },
  ];

  const adminLinks: NavLink[] = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/appointments', label: 'รายการนัดหมาย' },
    { href: '/admin/calendar', label: 'ปฏิทิน' },
    { href: '/admin/notifications', label: 'การแจ้งเตือน' },
    { href: '/admin/services', label: 'จัดการบริการ' },
    { 
      href: '/admin/settings', 
      label: 'ตั้งค่า',
      subLinks: [
        { href: '/admin/settings', label: 'ข้อมูลคลินิก' },
        { href: '/admin/settings/staff', label: 'จัดการบุคลากร' }
      ]
    },
    { href: '/admin/profile', label: 'โปรไฟล์' },
  ];

  const isAdminRole = role === 'admin' || role === 'super_admin' || role === 'clinic_owner' || role === 'clinic_admin' || role === 'clinic_staff';
  const isUserRole = role === 'user' || role === 'customer';

  // Filter admin links for clinic staff - they can see appointments but not manage services or settings
  let filteredAdminLinks = adminLinks;
  if (role === 'clinic_staff') {
    filteredAdminLinks = adminLinks.filter(link => 
      !['จัดการบริการ', 'ตั้งค่า'].includes(link.label)
    );
  }

  const links = isAdminRole ? filteredAdminLinks : isUserRole ? userLinks : publicLinks;

  return (
    <nav className="glass-ios border-b border-border-ios sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-12">
            <Link href={isAdminRole ? '/admin/dashboard' : clinicSlug ? `/c/${clinicSlug}` : "/"} className="shrink-0 flex items-center group">
              <span className="text-2xl font-display font-black tracking-tighter text-foreground group-hover:text-accent transition-colors">
                {clinicLabel.split(' ')[0]} <span className="font-light text-foreground-muted">{clinicLabel.split(' ').slice(1).join(' ')}</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                <div key={link.href} className="relative group/nav">
                  <Link
                    href={link.href}
                    className={cn(
                      "text-[13px] font-bold uppercase tracking-widest transition-all duration-300 py-4 flex items-center gap-1",
                      pathname === link.href || (link.subLinks && pathname.startsWith(link.href))
                        ? "text-accent"
                        : "text-foreground-muted hover:text-foreground"
                    )}
                  >
                    {link.label}
                    {link.subLinks && (
                      <svg className="w-3 h-3 opacity-50 group-hover/nav:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>

                  {link.subLinks && (
                    <div className="absolute top-[80%] pt-2 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:pointer-events-auto group-hover/nav:top-full transition-all duration-300 z-50">
                      <div className="bg-white/95 backdrop-blur-xl border border-border-ios/50 rounded-2xl shadow-2xl overflow-hidden min-w-[220px] p-2 flex flex-col gap-1">
                        {link.subLinks.map(sub => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                              "px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-200",
                              pathname === sub.href
                                ? "bg-accent/10 text-accent"
                                : "text-foreground-muted hover:bg-muted/80 hover:text-foreground hover:pl-5"
                            )}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[12px] font-black text-foreground uppercase tracking-wider">{user.name}</span>
                  <span className="text-[9px] font-bold text-accent uppercase tracking-widest leading-none mt-0.5">{role?.replace('_', ' ')}</span>
                </div>
                <div className="h-4 w-px bg-border-ios/60 mx-1 hidden sm:block"></div>
                <button 
                  onClick={async () => {
                    await fetch('/api/auth', { method: 'DELETE' });
                    window.location.href = clinicSlug ? `/c/${clinicSlug}` : '/';
                  }}
                  className="px-6 py-2.5 bg-foreground text-white rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-foreground/80 transition-all shadow-md active:scale-95"
                >
                  ออกจากระบบ
                </button>
              </div>
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
