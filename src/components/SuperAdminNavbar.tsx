'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Role } from '@/lib/constants';

export function SuperAdminNavbar({ user }: { user?: { name: string; role: Role } | null }) {
  const pathname = usePathname();

  return (
    <nav className="glass-ios border-b border-border-ios sticky top-0 z-50 bg-[#FBFBFB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-12">
            <Link href="/superadmin/dashboard" className="shrink-0 flex items-center group">
              <span className="text-2xl font-display font-black tracking-tighter text-foreground group-hover:text-accent transition-colors">
                QueueFlow <span className="font-light text-accent">Platform</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[12px] font-black text-foreground uppercase tracking-wider">{user.name}</span>
                  <span className="text-[9px] font-bold text-accent uppercase tracking-widest leading-none mt-0.5">PLATFORM SAAS OWNER</span>
                </div>
                <button 
                  onClick={async () => {
                    await fetch('/api/auth', { method: 'DELETE' });
                    window.location.href = '/';
                  }}
                  className="px-6 py-2.5 bg-foreground text-white rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-foreground/80 transition-all shadow-md active:scale-95 ml-4"
                >
                  ออกจากการจัดการ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
