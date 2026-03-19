'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  appointmentId?: string;
}

interface NotificationContextType {
  unreadCount: number;
  latestNotification: Notification | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  const [showToast, setShowToast] = useState(false);
  const lastCheckedId = useRef<string | null>(null);
  const router = useRouter();

  const fetchUnread = async () => {
    try {
      const res = await fetch('/api/admin/notifications?limit=1');
      const result = await res.json();
      
      if (result.success) {
        setUnreadCount(result.metadata.unreadCount);
        
        const latest = result.data[0];
        if (latest && !latest.isRead && latest.id !== lastCheckedId.current) {
          // New unread notification!
          if (lastCheckedId.current !== null) {
             setLatestNotification(latest);
             setShowToast(true);
             // Auto hide toast after 10 seconds
             setTimeout(() => setShowToast(false), 10000);
          }
          lastCheckedId.current = latest.id;
        } else if (!latest) {
          lastCheckedId.current = 'empty';
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, { method: 'PATCH' });
      await fetchUnread();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/admin/notifications/read-all', { method: 'PATCH' });
      await fetchUnread();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, latestNotification, markAsRead, markAllAsRead, refresh: fetchUnread }}>
      {children}
      
      {/* Floating Toast Notification */}
      {showToast && latestNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-full duration-500">
          <div 
            onClick={() => {
              markAsRead(latestNotification.id);
              setShowToast(false);
              router.push(`/admin/appointments?bookingId=${latestNotification.appointmentId}`);
            }}
            className="bg-white/90 backdrop-blur-xl border border-accent/20 shadow-2xl rounded-3xl p-5 min-w-[320px] max-w-[400px] cursor-pointer hover:scale-[1.02] transition-all group relative overflow-hidden"
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-accent/5 to-transparent pointer-events-none"></div>
            
            <div className="flex gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">New Booking Arrival</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowToast(false); }}
                    className="text-foreground-muted hover:text-foreground"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <p className="text-sm font-bold text-foreground leading-tight mb-1">มีรายการจองใหม่เข้ามา</p>
                <p className="text-[12px] text-foreground-muted line-clamp-2 leading-relaxed">
                  {latestNotification.message}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent group-hover:gap-3 transition-all">
                  View Details
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
