'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/providers/LanguageProvider';

interface Notification {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  appointmentId?: string;
}

interface NotificationPreferences {
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  autoMarkAsRead: boolean;
}

interface NotificationContextType {
  unreadCount: number;
  toasts: Notification[];
  preferences: NotificationPreferences;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updatePreference: (key: keyof NotificationPreferences, value: boolean) => void;
  refresh: () => Promise<void>;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const PREFERENCES_KEY = 'notification_preferences';
const SEEN_NOTIFICATIONS_KEY = 'seen_notification_ids';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    soundEnabled: true,
    browserNotificationsEnabled: false,
    autoMarkAsRead: false,
  });
  
  const { t } = useTranslation();
  const lastCheckedId = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  // Load preferences and seen IDs
  useEffect(() => {
    const savedPrefs = localStorage.getItem(PREFERENCES_KEY);
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error('Failed to parse preferences', e);
      }
    }

    // Prepare audio
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.volume = 0.4;
  }, []);

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs));

    if (key === 'browserNotificationsEnabled' && value) {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    }
  };

  const showBrowserNotification = (notif: Notification) => {
    if (preferences.browserNotificationsEnabled && Notification.permission === 'granted') {
      const n = new Notification(t('notifications.type_booking_created'), {
        body: notif.message,
        icon: '/logo.png', // Fallback, update if available
      });
      n.onclick = () => {
        window.focus();
        router.push(`/admin/appointments?bookingId=${notif.appointmentId}`);
      };
    }
  };

  const playSound = () => {
    if (preferences.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(e => console.warn('Audio play blocked', e));
    }
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchUnread = async () => {
    try {
      const res = await fetch('/api/admin/notifications?limit=5');
      const result = await res.json();
      
      if (result.success) {
        const newUnreadCount = result.metadata.unreadCount;
        setUnreadCount(newUnreadCount);
        
        const latestNotifications = result.data.filter((n: any) => !n.isRead);
        
        if (latestNotifications.length > 0) {
          const newest = latestNotifications[0];
          
          // Only show notification if it's truly new for this session
          if (newest.id !== lastCheckedId.current) {
            // If this isn't the first check of the session
            if (lastCheckedId.current !== null) {
              const seenIds = JSON.parse(sessionStorage.getItem(SEEN_NOTIFICATIONS_KEY) || '[]');
              
              // Filter out notifications we've already toasted in this session
              const newToasts = latestNotifications
                .filter((n: any) => !seenIds.includes(n.id))
                .slice(0, 3); // Max 3 new toasts

              if (newToasts.length > 0) {
                setToasts(prev => {
                  const combined = [...newToasts, ...prev].slice(0, 3);
                  return combined;
                });
                
                // Track seen IDs
                const updatedSeenIds = [...seenIds, ...newToasts.map((n: any) => n.id)];
                sessionStorage.setItem(SEEN_NOTIFICATIONS_KEY, JSON.stringify(updatedSeenIds));

                playSound();
                newToasts.forEach(showBrowserNotification);
              }
            }
            lastCheckedId.current = newest.id;
          }
        } else {
           lastCheckedId.current = 'empty';
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [preferences.browserNotificationsEnabled, preferences.soundEnabled]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setUnreadCount(prev => Math.max(0, prev - 1));
    setToasts(prev => prev.filter(t => t.id !== id));
    
    try {
      await fetch(`/api/admin/notifications/${id}/read`, { method: 'PATCH' });
      // We don't necessarily need to re-fetch immediately as we did an optimistic update
    } catch (error) {
      console.error('Failed to mark as read:', error);
      fetchUnread(); // Rollback if error
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setUnreadCount(0);
    setToasts([]);
    
    try {
      await fetch('/api/admin/notifications/read-all', { method: 'PATCH' });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      fetchUnread();
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      unreadCount, 
      toasts, 
      preferences, 
      markAsRead, 
      markAllAsRead, 
      updatePreference, 
      refresh: fetchUnread,
      dismissToast 
    }}>
      {children}
      
      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map((notif, idx) => (
          <div 
            key={notif.id}
            className="animate-in slide-in-from-right-full fade-in-0 duration-500 pointer-events-auto"
            style={{ transitionDelay: `${idx * 150}ms` }}
          >
            <div 
              onClick={() => {
                markAsRead(notif.id);
                router.push(`/admin/appointments?bookingId=${notif.appointmentId}`);
              }}
              className="bg-white/95 backdrop-blur-xl border border-accent/10 shadow-2xl rounded-3xl p-5 w-[340px] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-accent/5 to-transparent pointer-events-none"></div>
              
              <div className="flex gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0 shadow-inner">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-accent/80">{t('notifications.incoming_queue') || 'Incoming Queue'}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); dismissToast(notif.id); }}
                      className="text-foreground-muted hover:text-foreground p-1 -mt-1 -mr-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <p className="text-sm font-bold text-foreground leading-tight mb-1">{t('notifications.new_booking_alert') || 'มีรายการจองใหม่เข้ามา'}</p>
                  <p className="text-[12px] text-foreground-muted line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent group-hover:gap-3 transition-all animate-pulse">
                    {t('notifications.tap_to_verify') || 'Tap to verify'}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
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
