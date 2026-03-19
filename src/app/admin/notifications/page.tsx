'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useNotifications } from '@/providers/NotificationProvider';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRead, setFilterRead] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const { markAllAsRead, preferences, updatePreference } = useNotifications();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/notifications?limit=50';
      if (filterRead !== 'all') url += `&isRead=${filterRead === 'read'}`;
      if (filterType !== 'all') url += `&type=${filterType}`;
      
      const res = await fetch(url);
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
  }, [filterRead, filterType]);

  const handleMarkAll = async () => {
    await markAllAsRead();
    // Optimistically update local list if filter is 'unread'
    if (filterRead === 'unread') {
      setNotifications([]);
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-5xl font-display font-black text-foreground tracking-tighter mb-2">Communication Log</h1>
          <p className="text-[13px] font-black text-accent uppercase tracking-[0.3em]">Clinic Outreach & Event History</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1 items-end">
            <span className="text-[9px] font-black uppercase tracking-widest text-foreground-muted/50">Preferences</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={preferences.soundEnabled} 
                  onChange={(e) => updatePreference('soundEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-muted border border-border-ios/20 rounded-full peer peer-checked:bg-accent transition-all relative">
                   <div className="absolute left-0.5 top-0.5 w-2.5 h-2.5 bg-white rounded-full peer-checked:left-4.5 transition-all shadow-sm"></div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted group-hover:text-foreground">Sound</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={preferences.browserNotificationsEnabled} 
                  onChange={(e) => updatePreference('browserNotificationsEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-muted border border-border-ios/20 rounded-full peer peer-checked:bg-accent transition-all relative">
                   <div className="absolute left-0.5 top-0.5 w-2.5 h-2.5 bg-white rounded-full peer-checked:left-4.5 transition-all shadow-sm"></div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted group-hover:text-foreground">Desktop</span>
              </label>
            </div>
          </div>
          <button 
            onClick={handleMarkAll}
            className="h-12 px-6 bg-foreground text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-accent transition-all shadow-lg active:scale-95 shrink-0"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center bg-muted/50 rounded-xl p-1 border border-border-ios/10">
          {['all', 'unread', 'read'].map(f => (
            <button
              key={f}
              onClick={() => setFilterRead(f)}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                filterRead === f ? "bg-white text-accent shadow-sm" : "text-foreground-muted hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-muted/50 border border-border-ios/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-foreground outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="all">All Types</option>
          <option value="booking_created">New Bookings</option>
          <option value="booking_confirmed">Confirmed</option>
          <option value="booking_cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card-luxury overflow-hidden border-border-ios/30 bg-white/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
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
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8">
                       <div className="h-4 bg-muted rounded-md w-full"></div>
                    </td>
                  </tr>
                ))
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                     <div className="flex flex-col items-center gap-4 opacity-30">
                       <svg className="w-12 h-12 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                       <p className="text-[13px] font-bold text-foreground-muted uppercase tracking-[0.2em]">No records matching filters</p>
                     </div>
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
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-[9px] font-black text-accent uppercase tracking-widest border border-border-ios/40">
                        {notif.channel}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-[11px] font-bold text-foreground-muted uppercase tracking-widest opacity-80">{notif.type.replace('_', ' ')}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${
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
                          className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-foreground opacity-0 group-hover:opacity-100 transition-all underline underline-offset-8 decoration-accent/30"
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
      </div>
      
      <div className="mt-8 flex justify-between items-center text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] opacity-40">
        <p className="italic">Audit trail maintained for current billing cycle</p>
        <p>Aura CMS v2.4.0</p>
      </div>
    </div>
  );
}
