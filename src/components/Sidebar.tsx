'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Role } from '@/lib/constants';

type SidebarProps = {
  user?: { name: string; email?: string; role: Role } | null;
  clinic?: { name: string; slug: string } | null;
};

export function Sidebar({ user, clinic }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Filter links based on role
  const role = user?.role;
  const isSuperAdmin = role === 'super_admin';
  const isClinicAdmin = role === 'admin' || role === 'clinic_owner' || role === 'clinic_admin';
  const isStaff = role === 'clinic_staff';
  
  if (!user || (!isSuperAdmin && !isClinicAdmin && !isStaff)) return null;

  const icons = {
    dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>,
    appointments: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
    notifications: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
    services: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
    settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    profile: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  };

  const links = isSuperAdmin ? [
    { href: '/superadmin/dashboard', label: 'Platform Dashboard', icon: icons.dashboard }
  ] : [
    { href: '/admin/dashboard', label: 'Dashboard', icon: icons.dashboard },
    { href: '/admin/appointments', label: 'รายการนัดหมาย', icon: icons.appointments },
    { href: '/admin/calendar', label: 'ปฏิทิน', icon: icons.calendar },
    { href: '/admin/notifications', label: 'การแจ้งเตือน', icon: icons.notifications },
    ...(isClinicAdmin ? [{ href: '/admin/services', label: 'จัดการบริการ', icon: icons.services }] : []),
    ...(isClinicAdmin ? [{ 
      href: '#', 
      label: 'ตั้งค่า', 
      icon: icons.settings,
      subLinks: [
        { href: '/admin/settings', label: 'ข้อมูลคลินิก' },
        { href: '/admin/settings/staff', label: 'จัดการบุคลากร' }
      ]
    }] : []),
    { href: '/admin/profile', label: 'โปรไฟล์', icon: icons.profile },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 h-14 w-14 bg-foreground text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside 
        className={cn(
          "bg-white border-r border-border-ios/50 flex flex-col transition-all duration-300 z-50 sticky top-0 h-screen overflow-x-hidden",
          "fixed lg:sticky",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-border-ios/30 sticky top-0 bg-white z-10 shrink-0">
          <div className={cn("flex flex-col truncate transition-opacity duration-300", isCollapsed && "lg:opacity-0")}>
            <span className="text-xl font-display font-black tracking-tighter text-foreground truncate">
              {isSuperAdmin ? 'QueueFlow' : clinic?.name || 'Aura Clinic'}
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent truncate">
              {isSuperAdmin ? 'Platform Admin' : 'Clinic Management'}
            </span>
          </div>
          
          <button 
            onClick={() => isMobileOpen ? setIsMobileOpen(false) : setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-2 rounded-lg text-foreground-muted cursor-pointer hover:bg-muted/50 hover:text-foreground transition-all flex shrink-0 items-center justify-center",
              isCollapsed && "lg:mx-auto lg:w-full"
            )}
          >
            {isMobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300">
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            )}
          </button>
        </div>

      <div className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden py-6 flex flex-col gap-2 relative",
        isCollapsed ? "px-2" : "px-4"
      )}>
        {links.map((link, idx) => {
          const isActive = pathname === link.href || (link.subLinks && link.subLinks.some(sub => pathname === sub.href));
          
          if (link.subLinks && !isCollapsed) {
            return (
              <div key={idx} className="flex flex-col gap-1">
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[12px] font-bold uppercase tracking-widest transition-all",
                    isActive || settingsOpen
                      ? "bg-foreground text-white" 
                      : "text-foreground-muted hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                  </div>
                  <span className="text-[10px]">{settingsOpen ? '▼' : '▶'}</span>
                </button>
                {settingsOpen && (
                  <div className="flex flex-col pl-12 pr-4 gap-1 mt-1">
                    {link.subLinks.map(sub => (
                      <Link 
                        key={sub.href} 
                        href={sub.href}
                        className={cn(
                          "py-2 px-4 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
                          pathname === sub.href
                            ? "bg-accent/10 text-accent"
                            : "text-foreground-muted/70 hover:text-foreground"
                        )}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          if (link.subLinks && isCollapsed) {
            // Simplified sublink handling for collapsed state (just goes to first link or opens popup)
            return (
              <Link 
                key={idx} 
                href={link.href === '#' ? link.subLinks[0].href : link.href}
                title={link.label}
                className={cn(
                  "flex items-center justify-center h-12 w-12 mx-auto rounded-2xl transition-all relative group",
                  isActive 
                    ? "bg-foreground text-white shadow-md shadow-foreground/20" 
                    : "text-foreground-muted hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <span className="text-xl">{link.icon}</span>
              </Link>
            );
          }

          return (
            <Link 
              key={idx} 
              href={link.href}
              title={isCollapsed ? link.label : undefined}
              className={cn(
                "flex items-center rounded-2xl transition-all relative group",
                isCollapsed ? "justify-center h-12 w-12 mx-auto" : "px-4 py-3",
                isActive 
                  ? "bg-foreground text-white shadow-md shadow-foreground/20" 
                  : "text-foreground-muted hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-4">
                <span className="text-xl">{link.icon}</span>
                {!isCollapsed && <span className="text-[12px] font-bold uppercase tracking-widest">{link.label}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border-ios/30 shrink-0 flex flex-col gap-1">
        {/* Luxury User Profile Anchor */}
        {user && (
          <div className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-2xl transition-all cursor-default group hover:bg-muted/40",
            isCollapsed ? "justify-center px-0" : ""
          )}>
            <div className="w-8 h-8 rounded-full bg-foreground text-white flex items-center justify-center text-[11px] font-black shrink-0 shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-[12px] font-bold text-foreground truncate">{user.name}</span>
                <span className="text-[10px] text-foreground-muted truncate">
                  {user.email || user.role.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>
        )}

        <button 
          onClick={async () => {
             await fetch('/api/auth', { method: 'DELETE' });
             window.location.href = '/login';
          }}
          className={cn(
            "w-full flex items-center rounded-2xl transition-all text-red-500 hover:bg-red-500/10 hover:text-red-600",
            isCollapsed ? "justify-center h-12 px-0" : "px-3 py-3 gap-3"
          )}
        >
          <span className="text-xl">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </span>
          {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">ออกจากระบบ</span>}
        </button>
      </div>
      </aside>
    </>
  );
}
