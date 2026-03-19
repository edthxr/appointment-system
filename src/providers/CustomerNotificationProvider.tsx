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

const PREFERENCES_KEY = 'customer_notification_preferences';
const SEEN_NOTIFICATIONS_KEY = 'customer_seen_notification_ids';

export function CustomerNotificationProvider({ 
  children, 
  clinicSlug 
}: { 
  children: React.ReactNode;
  clinicSlug: string;
}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    soundEnabled: true,
    browserNotificationsEnabled: false,
  });
  
  const { t } = useTranslation();
  const lastCheckedId = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  // Load preferences
  useEffect(() => {
    const savedPrefs = localStorage.getItem(PREFERENCES_KEY);
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error('Failed to parse preferences', e);
      }
    }

    // Prepare audio - Using a slightly softer/friendlier notification sound for customers
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.volume = 0.3;
  }, []);

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs));

    if (key === 'browserNotificationsEnabled' && value) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission !== 'granted') {
          Notification.requestPermission();
        }
      }
    }
  };

  const showBrowserNotification = (notif: Notification) => {
    if (preferences.browserNotificationsEnabled && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const typeLabel = t(`notifications.type_${notif.type.toLowerCase()}`);
      const n = new Notification(typeLabel !== `notifications.type_${notif.type.toLowerCase()}` ? typeLabel : t('notifications.alert_title'), {
        body: notif.message,
        icon: '/logo.png',
      });
      n.onclick = () => {
        window.focus();
        router.refresh();
        router.push(`/c/${clinicSlug}/my-bookings?bookingId=${notif.appointmentId}`);
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
      const res = await fetch(`/api/notifications?clinicSlug=${clinicSlug}&limit=5`);
      const result = await res.json();
      
      if (result.success) {
        const newUnreadCount = result.pagination.unreadCount || 0;
        setUnreadCount(newUnreadCount);
        
        const latestNotifications = result.data.filter((n: any) => !n.isRead);
        
        if (latestNotifications.length > 0) {
          const newest = latestNotifications[0];
          
          if (lastCheckedId.current !== null && newest.id !== lastCheckedId.current) {
            const newIndex = latestNotifications.findIndex((n: any) => n.id === lastCheckedId.current);
            const trulyNewNotifications = newIndex === -1 ? latestNotifications : latestNotifications.slice(0, newIndex);
            
            if (trulyNewNotifications.length > 0) {
              const seenIds = JSON.parse(sessionStorage.getItem(SEEN_NOTIFICATIONS_KEY) || '[]');
              const activeToasts = trulyNewNotifications.filter((n: any) => !seenIds.includes(n.id)).slice(0, 3);

              if (activeToasts.length > 0) {
                setToasts(prev => {
                  const combined = [...activeToasts, ...prev].slice(0, 3);
                  return combined;
                });
                
                const updatedSeenIds = [...seenIds, ...activeToasts.map((n: any) => n.id)];
                sessionStorage.setItem(SEEN_NOTIFICATIONS_KEY, JSON.stringify(updatedSeenIds));

                playSound();
                activeToasts.forEach(showBrowserNotification);
              }
            }
          }
          lastCheckedId.current = newest.id;
        } else {
           lastCheckedId.current = 'empty';
        }
      }
    } catch (error) {
      console.error('Failed to fetch customer notifications:', error);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [clinicSlug]);

  const markAsRead = async (id: string) => {
    setUnreadCount(prev => Math.max(0, prev - 1));
    setToasts(prev => prev.filter(t => t.id !== id));
    
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (error) {
      console.error('Failed to mark as read:', error);
      fetchUnread(); 
    }
  };

  const markAllAsRead = async () => {
    setUnreadCount(0);
    setToasts([]);
    
    try {
      await fetch(`/api/notifications/read-all?clinicSlug=${clinicSlug}`, { method: 'PATCH' });
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
      <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map((notif, idx) => (
          <div 
            key={notif.id}
            className="animate-in slide-in-from-right-full fade-in-0 duration-500 pointer-events-auto"
            style={{ transitionDelay: `${idx * 150}ms` }}
          >
            <div 
              onClick={() => {
                markAsRead(notif.id);
                router.refresh();
                router.push(`/c/${clinicSlug}/my-bookings?bookingId=${notif.appointmentId}`);
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
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-accent/80">{t('notifications.alert_title') || 'การแจ้งเตือน'}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); dismissToast(notif.id); }}
                      className="text-foreground-muted hover:text-foreground p-1 -mt-1 -mr-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <p className="text-sm font-bold text-foreground leading-tight mb-1">
                    {t(`notifications.type_${notif.type.toLowerCase()}`) !== `notifications.type_${notif.type.toLowerCase()}` 
                      ? t(`notifications.type_${notif.type.toLowerCase()}`) 
                      : t('notifications.new_update')}
                  </p>
                  <p className="text-[12px] text-foreground-muted line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export const useCustomerNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useCustomerNotifications must be used within a CustomerNotificationProvider');
  }
  return context;
};
