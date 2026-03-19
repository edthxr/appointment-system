'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useNotifications } from '@/providers/NotificationProvider';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { markAllAsRead, refresh } = useNotifications();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications?limit=50');
      const result = await res.json();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Mark all as read when viewing this page
    const timer = setTimeout(() => {
      markAllAsRead();
    }, 2000); // Wait 2s to show they were "new" before clearing
    
    return () => clearTimeout(timer);
  }, []);

  if (loading && notifications.length === 0) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-16 bg-muted rounded-2xl w-1/3"></div>
        <div className="h-64 bg-muted rounded-3xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="text-5xl font-display font-black text-foreground tracking-tighter mb-2">Communication Log</h1>
          <p className="text-[13px] font-black text-accent uppercase tracking-[0.3em]">Clinic Outreach & Event History</p>
        </div>
        <button 
          onClick={async () => {
            await markAllAsRead();
            fetchNotifications();
          }}
          className="text-[10px] font-black uppercase tracking-widest text-foreground-muted hover:text-accent transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div className="card-luxury overflow-hidden border-border-ios/40">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/30 border-b border-border-ios/20">
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Timestamp</th>
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Recipient</th>
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Channel</th>
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Type</th>
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-ios/10">
            {notifications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                   <p className="text-[13px] font-bold text-foreground-muted italic opacity-50 uppercase tracking-widest">No notification events recorded</p>
                </td>
              </tr>
            ) : (
              notifications.map((notif: any) => (
                <tr key={notif.id} className={cn(
                  "hover:bg-accent/2 transition-colors group relative",
                  !notif.isRead && "bg-accent/5"
                )}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {!notif.isRead && <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 shadow-sm shadow-red-500/50" />}
                      <div>
                        <p className="text-[13px] font-bold text-foreground">{format(new Date(notif.createdAt), 'dd MMM yyyy')}</p>
                        <p className="text-[11px] text-foreground-muted opacity-60 font-medium lowercase tracking-tighter">{format(new Date(notif.createdAt), 'HH:mm')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[13px] font-black text-foreground uppercase tracking-widest">{notif.user?.name || 'Unknown User'}</p>
                    <p className="text-[11px] text-foreground-muted opacity-60 font-medium italic">{notif.user?.email}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-[10px] font-black text-accent uppercase tracking-widest border border-border-ios/40">
                      {notif.channel}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[11px] font-bold text-foreground-muted uppercase tracking-widest opacity-80">{notif.type.replace('_', ' ')}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${
                          notif.status === 'sent' ? 'bg-green-500' :
                          notif.status === 'failed' ? 'bg-red-500' : 'bg-amber-400'
                       }`} />
                       <p className="text-[11px] font-black uppercase tracking-widest text-foreground opacity-80">{notif.status}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {notif.appointmentId && (
                      <Link 
                        href={`/admin/appointments?bookingId=${notif.appointmentId}`}
                        className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-foreground opacity-0 group-hover:opacity-100 transition-all underline underline-offset-4"
                      >
                        Details
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 flex justify-end">
        <p className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] opacity-40 italic">
          Audit trail maintained for current billing cycle
        </p>
      </div>
    </div>
  );
}
