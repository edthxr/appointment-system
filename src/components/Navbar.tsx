'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CustomerNotificationDropdown } from './CustomerNotificationDropdown';

import { ROLES, Role } from '@/lib/constants';

export function Navbar({ 
  user,
  clinic 
}: { 
  user?: { name: string; email?: string; role: Role } | null;
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

  const isAdminRole = role === ROLES.SUPER_ADMIN || role === 'clinic_owner' || role === 'clinic_admin' || role === 'clinic_staff' || role === 'admin';
  const isUserRole = role === 'user' || role === 'customer';

  // For the main desktop nav, we only show public links
  const links = publicLinks;

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    window.location.href = clinicSlug ? `/c/${clinicSlug}` : '/';
  };

  return (
    <nav className="glass-ios border-b border-border-ios sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-12">
            <Link href={clinicSlug ? `/c/${clinicSlug}` : (isAdminRole ? (role === ROLES.SUPER_ADMIN ? '/superadmin/dashboard' : '/admin/dashboard') : "/")} className="shrink-0 flex items-center group">
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
            {user && clinicSlug && (
              <CustomerNotificationDropdown clinicSlug={clinicSlug} />
            )}
            {user ? (
              <div className="relative group/user">
                {/* Trigger: User Info */}
                <div className="flex items-center gap-4 cursor-pointer py-4">
                  <div className="hidden sm:flex flex-col items-end text-right">
                    <span className="text-[12px] font-black text-foreground uppercase tracking-wider truncate max-w-[150px]">{user.name}</span>
                    <span className="text-[10px] text-accent tracking-widest leading-none mt-1 truncate max-w-[150px] font-bold">
                      {user.email || role?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-foreground text-white flex items-center justify-center text-[14px] font-black shadow-lg group-hover/user:scale-105 transition-transform duration-300">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Dropdown Menu */}
                <div className="absolute top-[80%] right-0 pt-2 opacity-0 pointer-events-none group-hover/user:opacity-100 group-hover/user:pointer-events-auto group-hover/user:top-full transition-all duration-300 z-50">
                  <div className="bg-white/95 backdrop-blur-xl border border-border-ios/50 rounded-2xl shadow-2xl overflow-hidden min-w-[240px] p-2 flex flex-col gap-1">
                    {isAdminRole && (
                      <Link
                        href={role === ROLES.SUPER_ADMIN ? '/superadmin/dashboard' : '/admin/dashboard'}
                        className="flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl text-foreground hover:bg-muted transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        {role === ROLES.SUPER_ADMIN ? 'Platform Admin' : 'Clinic Management'}
                      </Link>
                    )}

                    {isUserRole && (
                      <Link
                        href={clinicSlug ? `/c/${clinicSlug}/my-bookings` : '/my-bookings'}
                        className="flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl text-foreground hover:bg-muted transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        รายการจองของฉัน
                      </Link>
                    )}

                    <div className="h-px bg-border-ios/30 my-1"></div>

                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl text-red-500 hover:bg-red-50/80 transition-all text-left"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
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
