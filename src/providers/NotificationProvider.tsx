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
  const lastActionTime = useRef<number>(0);
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
      const typeLabel = t(`notifications.type_${notif.type.toLowerCase()}`);
      const n = new Notification(typeLabel !== `notifications.type_${notif.type.toLowerCase()}` ? typeLabel : t('notifications.new_booking_alert'), {
        body: notif.message,
        icon: '/logo.png',
      });
      n.onclick = () => {
        window.focus();
        router.push(`/admin/notifications?notificationId=${notif.id}`);
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
    // If we just performed a manual action, ignore polling for 3 seconds 
    // to give database time to settle and let our direct API response take precedence.
    if (Date.now() - lastActionTime.current < 3000) {
      return;
    }

    try {
      const res = await fetch('/api/admin/notifications?limit=10');
      const result = await res.json();
      
      if (result.success) {
        // Double-check lock again because the fetch itself took time
        if (Date.now() - lastActionTime.current < 3000) return;

        setUnreadCount(result.metadata.unreadCount);
        
        const unreadItems = result.data.filter((n: any) => !n.isRead);
        const latestSystemNotifications = unreadItems.filter((n: any) => n.channel === 'system');
        
        if (latestSystemNotifications.length > 0) {
          const newest = latestSystemNotifications[0];
          
          if (lastCheckedId.current !== null && newest.id !== lastCheckedId.current) {
            const newIndex = latestSystemNotifications.findIndex((n: any) => n.id === lastCheckedId.current);
            const trulyNew = newIndex === -1 ? latestSystemNotifications : latestSystemNotifications.slice(0, newIndex);
            
            if (trulyNew.length > 0) {
              const seenIds = JSON.parse(sessionStorage.getItem(SEEN_NOTIFICATIONS_KEY) || '[]');
              const newToasts = trulyNew.filter((n: any) => !seenIds.includes(n.id)).slice(0, 3);

              if (newToasts.length > 0) {
                setToasts(prev => [...newToasts, ...prev].slice(0, 3));
                const updatedSeenIds = [...seenIds, ...newToasts.map((n: any) => n.id)];
                sessionStorage.setItem(SEEN_NOTIFICATIONS_KEY, JSON.stringify(updatedSeenIds));

                playSound();
                newToasts.forEach(showBrowserNotification);
              }
            }
          }
          lastCheckedId.current = newest.id;
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
    lastActionTime.current = Date.now();
    
    // Optimistic update
    setUnreadCount(prev => Math.max(0, prev - 1));
    setToasts(prev => prev.filter(t => t.id !== id));
    
    try {
      const res = await fetch(`/api/admin/notifications/${id}/read`, { method: 'PATCH' });
      const result = await res.json();
      
      if (result.success && typeof result.count === 'number') {
        // Use the absolute truth from the server immediately
        lastActionTime.current = Date.now(); 
        setUnreadCount(result.count);
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
      fetchUnread(); 
    }
  };

  const markAllAsRead = async () => {
    lastActionTime.current = Date.now();
    
    // Optimistic update
    setUnreadCount(0);
    setToasts([]);
    
    try {
      const res = await fetch('/api/admin/notifications/read-all', { method: 'PATCH' });
      const result = await res.json();
      
      if (result.success && typeof result.count === 'number') {
        lastActionTime.current = Date.now();
        setUnreadCount(result.count);
      }
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
                router.push(`/admin/notifications?notificationId=${notif.id}`);
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
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-accent/80">{t('notifications.alert_title') || 'แจ้งเตือนระบบ'}</p>
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
                      : t('notifications.new_booking_alert')}
                  </p>
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
}
