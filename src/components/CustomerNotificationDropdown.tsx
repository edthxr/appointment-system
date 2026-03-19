'use client';

import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  appointmentId?: string;
}

export function CustomerNotificationDropdown({ clinicSlug }: { clinicSlug: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async (pageNum = 1, replace = false) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const isReadFilter = activeTab === 'unread' ? '&isRead=false' : '';
      const res = await fetch(`/api/notifications?clinicSlug=${clinicSlug}&page=${pageNum}&limit=5${isReadFilter}`);
      const result = await res.json();
      
      if (result.success) {
        if (replace) {
          setNotifications(result.data);
        } else {
          setNotifications(prev => [...prev, ...result.data]);
        }
        setUnreadCount(result.pagination.unreadCount || 0);
        setHasMore(result.pagination.page < result.pagination.totalPages);
        setPage(result.pagination.page);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, true);
    }
  }, [isOpen, activeTab]);

  // Initial unread count check
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const res = await fetch(`/api/notifications?clinicSlug=${clinicSlug}&limit=1`);
        const result = await res.json();
        if (result.success) {
          setUnreadCount(result.pagination.unreadCount || 0);
        }
      } catch (e) {}
    };
    checkUnread();
    const interval = setInterval(checkUnread, 30000);
    return () => clearInterval(interval);
  }, [clinicSlug]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (e) {}
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors group"
      >
        <svg className="w-6 h-6 text-foreground-muted group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[360px] max-h-[500px] bg-white/95 backdrop-blur-xl border border-border-ios/50 rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-5 pb-3">
            <h3 className="text-xl font-display font-black text-foreground mb-4">การแจ้งเตือน</h3>
            <div className="flex gap-2 p-1 bg-muted/50 rounded-2xl">
              <button 
                onClick={() => setActiveTab('all')}
                className={cn(
                  "flex-1 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all",
                  activeTab === 'all' ? "bg-white shadow-sm text-foreground" : "text-foreground-muted hover:text-foreground"
                )}
              >
                ทั้งหมด
              </button>
              <button 
                onClick={() => setActiveTab('unread')}
                className={cn(
                  "flex-1 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all",
                  activeTab === 'unread' ? "bg-white shadow-sm text-foreground" : "text-foreground-muted hover:text-foreground"
                )}
              >
                ยังไม่ได้อ่าน
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[100px] max-h-[350px]">
            {notifications.length > 0 ? (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif.id)}
                    className={cn(
                      "p-4 px-5 flex gap-4 cursor-pointer transition-all hover:bg-muted/50 relative group",
                      !notif.isRead && "bg-accent/5"
                    )}
                  >
                    {!notif.isRead && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-accent rounded-full"></div>
                    )}
                    <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm leading-snug mb-1", notif.isRead ? "text-foreground-muted" : "text-foreground font-medium")}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-wider">
                        {format(new Date(notif.createdAt), 'dd MMM yyyy HH:mm', { locale: th })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <p className="text-xs font-black uppercase tracking-widest">ไม่มีการแจ้งเตือน</p>
              </div>
            )}
            
            {hasMore && (
              <button 
                onClick={() => fetchNotifications(page + 1)}
                disabled={isLoading}
                className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-accent hover:bg-accent/5 transition-all disabled:opacity-50 border-t border-border-ios/30"
              >
                {isLoading ? 'กำลังโหลด...' : 'ดูการแจ้งเตือนก่อนหน้า'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
