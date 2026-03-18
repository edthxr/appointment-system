'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ appointments: 0, services: 0 });

  useEffect(() => {
    // Simple fetch to show some data on dashboard
    Promise.all([
      fetch('/api/appointments').then(res => res.json()),
      fetch('/api/services').then(res => res.json())
    ]).then(([appointments, services]) => {
      setStats({
        appointments: appointments.data?.length || 0,
        services: services.data?.length || 0
      });
    });
  }, []);

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-black text-foreground tracking-tighter mb-2">Management Workspace</h1>
        <p className="text-[13px] font-bold text-foreground-muted uppercase tracking-widest">Aura Clinic Performance Overview</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="card-luxury">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Total Appointments</p>
            <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center border border-border-ios text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-5xl font-display font-black text-foreground tracking-tighter">{stats.appointments}</p>
          <p className="text-[11px] text-green-600 font-bold mt-4 flex items-center gap-1">
            <span className="bg-green-100 px-1.5 py-0.5 rounded-md">↑ 12%</span>
            <span className="opacity-60 uppercase tracking-widest text-[9px]">vs last month</span>
          </p>
        </div>

        <div className="card-luxury">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Active Services</p>
            <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center border border-border-ios text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
          <p className="text-5xl font-display font-black text-foreground tracking-tighter">{stats.services}</p>
          <p className="text-[11px] text-foreground-muted font-bold mt-4 uppercase tracking-widest opacity-60">Verified Offerings</p>
        </div>

        <div className="card-luxury">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Est. Revenue</p>
            <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center border border-border-ios text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 1.254-3 2.8s1.343 2.8 3 2.8 3 1.254 3 2.8-1.343 2.8-3 2.8m0-11.2V3m0 16v-5m0-1c-1.657 0-3-1.254-3-2.8s1.343-2.8 3-2.8 3 1.254 3 2.8-1.343 2.8-3 2.8" />
              </svg>
            </div>
          </div>
          <p className="text-5xl font-display font-black text-foreground tracking-tighter">฿42.5K</p>
          <p className="text-[11px] text-green-600 font-bold mt-4 flex items-center gap-1">
            <span className="bg-green-100 px-1.5 py-0.5 rounded-md">↑ 8.4%</span>
            <span className="opacity-60 uppercase tracking-widest text-[9px]">Growth rate</span>
          </p>
        </div>

        <div className="card-luxury">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">New Consultations</p>
            <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center border border-border-ios text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <p className="text-5xl font-display font-black text-foreground tracking-tighter">12</p>
          <p className="text-[11px] text-accent font-bold mt-4 uppercase tracking-widest opacity-80">+5 Priority Cases</p>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-2xl font-display font-black mb-8 text-foreground uppercase tracking-[0.15em]">Recent Journal</h2>
        <div className="card-luxury py-20 text-center border-dashed border-2 bg-muted/30">
          <p className="text-foreground-muted text-[13px] font-bold uppercase tracking-widest italic opacity-50">
            No synchronization events recorded in current cycle
          </p>
        </div>
      </div>
    </div>
  );
}
