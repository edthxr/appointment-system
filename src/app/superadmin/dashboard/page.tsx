'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Sparkles, AlertTriangle, CreditCard, Rocket, Shield, ShieldAlert, Activity, Calendar } from 'lucide-react';

type ClinicStats = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  totalAppointments: number;
  revenue: number;
};

export default function SuperAdminDashboard() {
  const [clinics, setClinics] = useState<ClinicStats[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const Sparkline = () => (
    <svg className="w-full h-12 text-accent opacity-50" viewBox="0 0 100 20" preserveAspectRatio="none">
      <path d="M0 15 Q 10 5, 20 12 T 40 8 T 60 14 T 80 6 T 100 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  useEffect(() => {
    fetchClinics();
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/superadmin/recent-activity');
      const data = await res.json();
      if (data.success) {
        setActivities(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchClinics = async () => {
    try {
      const res = await fetch('/api/superadmin/clinics');
      const data = await res.json();
      if (data.success) {
        setClinics(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch clinics:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClinics = useMemo(() => {
    return clinics.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' ? true : 
                          filterStatus === 'active' ? c.isActive : !c.isActive;
      return matchesSearch && matchesStatus;
    });
  }, [clinics, searchQuery, filterStatus]);

  const totals = useMemo(() => {
    return clinics.reduce((acc, curr) => ({
      revenue: acc.revenue + curr.revenue,
      appointments: acc.appointments + curr.totalAppointments,
      active: acc.active + (curr.isActive ? 1 : 0)
    }), { revenue: 0, appointments: 0, active: 0 });
  }, [clinics]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this clinic?`)) return;
    
    try {
      const res = await fetch(`/api/superadmin/clinics/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setClinics(clinics.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleCreateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/superadmin/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (data.success) {
        setClinics([data.data, ...clinics]);
        setIsModalOpen(false);
        setFormData({ name: '', slug: '' });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-display font-black text-foreground tracking-tighter mb-2">Platform Overview</h1>
          <p className="text-[13px] font-black text-accent uppercase tracking-[0.3em]">SaaS Multi-Tenant Operations</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-foreground text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
          New Tenant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card-luxury p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-accent/10 transition-colors" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-muted mb-2">Total MRR / Revenue</div>
            <div className="text-5xl font-display font-black tracking-tighter text-foreground mb-4">
              ฿{(totals.revenue / 1000).toFixed(1)}K
            </div>
            <div className="mb-4">
              <Sparkline />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-600">Global</span>
            <span className="text-[11px] font-bold text-foreground-muted tracking-wide">Lifetime processed volume</span>
          </div>
        </div>

        <div className="card-luxury p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-accent/10 transition-colors" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-muted mb-2">Active Tenants</div>
            <div className="text-5xl font-display font-black tracking-tighter text-foreground mb-4">
              {totals.active} <span className="text-2xl text-foreground-muted/50">/ {clinics.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-accent/10 text-accent">Healthy</span>
             <span className="text-[11px] font-bold text-foreground-muted tracking-wide">Operating clinics</span>
          </div>
        </div>

        <div className="card-luxury p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-accent/10 transition-colors" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-muted mb-2">Total Bookings</div>
            <div className="text-5xl font-display font-black tracking-tighter text-foreground mb-4">
              {totals.appointments.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
             <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-600">Platform</span>
             <span className="text-[11px] font-bold text-foreground-muted tracking-wide">Appointments managed</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input 
            type="text" 
            placeholder="Search by clinic name or slug..." 
            className="w-full pl-12 pr-4 py-4 card-luxury border-none text-[13px] focus:ring-1 ring-accent/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'banned'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
                filterStatus === status 
                  ? "bg-foreground text-white shadow-lg" 
                  : "bg-white text-foreground-muted hover:bg-muted/50 border border-border-ios/20"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="card-luxury overflow-hidden border-border-ios/50">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/30 border-b border-border-ios/20">
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Tenant Entity</th>
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] text-right">Revenue</th>
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] text-right">Routing</th>
              <th className="px-6 py-5 text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-ios/10">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-foreground-muted text-[13px] font-bold uppercase tracking-widest animate-pulse">Loading Platform Data...</td></tr>
            ) : filteredClinics.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-foreground-muted text-[13px] font-bold uppercase tracking-widest italic opacity-50">No results found matching your criteria</td></tr>
            ) : (
              filteredClinics.map((clinic) => (
                <tr key={clinic.id} className={`hover:bg-accent/2 transition-colors group ${!clinic.isActive ? 'opacity-60 bg-muted/20' : ''}`}>
                  <td className="px-6 py-5">
                    <p className="text-[13px] font-bold text-foreground flex items-center gap-2">
                      {clinic.name}
                      {!clinic.isActive && <span className="text-[9px] px-1.5 py-0.5 rounded border border-red-500/30 text-red-500 uppercase tracking-widest font-black">Suspended</span>}
                    </p>
                    <p className="text-[11px] text-foreground-muted opacity-80 font-medium tracking-tight mt-0.5">Joined {format(new Date(clinic.createdAt), 'dd MMM yyyy')}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${clinic.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                       <span className="text-[11px] font-black uppercase tracking-widest text-foreground/80">
                         {clinic.isActive ? 'Active' : 'Banned'}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <p className="text-[13px] font-black text-foreground">฿{clinic.revenue.toLocaleString()}</p>
                    <p className="text-[10px] text-foreground-muted uppercase tracking-widest font-medium mt-0.5">{clinic.totalAppointments} appts</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <a href={`/c/${clinic.slug}`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-accent hover:underline lowercase tracking-tight">
                      /c/{clinic.slug}
                    </a>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleToggleStatus(clinic.id, clinic.isActive)}
                      className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-colors ${
                        clinic.isActive 
                        ? 'text-red-500 hover:text-red-700 bg-red-500/5 hover:bg-red-500/10' 
                        : 'text-green-600 hover:text-green-700 bg-green-500/10 hover:bg-green-500/20'
                      }`}
                    >
                      {clinic.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-[32px] font-display font-black tracking-tighter text-foreground mb-1">Provision Tenant</h2>
            <p className="text-[11px] font-bold text-foreground-muted uppercase tracking-widest mb-10">Create immediately dedicated workspace</p>
            
            {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[12px] font-bold">{error}</div>}
            
            <form onSubmit={handleCreateClinic} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] ml-2">Registered Clinic Name</label>
                <div className="p-2 rounded-4xl border border-border-ios/20 bg-white">
                  <input 
                    required 
                    type="text" 
                    className="w-full bg-muted/20 rounded-3xl py-5 px-8 text-[14px] font-medium border-none focus:outline-none focus:ring-2 ring-accent/20 placeholder:text-foreground-muted/40 transition-all font-sans" 
                    placeholder="e.g. Aura Premium Clinic" 
                    value={formData.name} 
                    onChange={e => {
                      const newName = e.target.value;
                      setFormData(prev => {
                        const oldAutoSlug = slugify(prev.name);
                        const isAutoSlugOrEmpty = prev.slug === '' || prev.slug === oldAutoSlug;
                        return {
                          ...prev,
                          name: newName,
                          slug: isAutoSlugOrEmpty ? slugify(newName) : prev.slug
                        };
                      });
                    }} 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] ml-2">URL Routing Slug</label>
                <div className="p-2 rounded-4xl border border-border-ios/20 bg-white flex items-stretch">
                  <div className="w-16 flex items-center justify-center shrink-0">
                    <span className="text-[13px] font-mono font-black text-foreground-muted/40 leading-none">/c/</span>
                  </div>
                  <input 
                    required 
                    type="text" 
                    className="flex-1 bg-muted/20 rounded-3xl py-5 px-8 text-[14px] font-mono lowercase border-none focus:outline-none focus:ring-2 ring-accent/20 placeholder:text-foreground-muted/40 transition-all" 
                    placeholder="aura-premium" 
                    value={formData.slug} 
                    onChange={e => setFormData({...formData, slug: slugify(e.target.value)})} 
                  />
                </div>
                <p className="text-[9px] font-medium text-foreground-muted/40 mt-3 ml-2 tracking-tight">Only lowercase letters, numbers, and hyphens permitted.</p>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[11px] font-black text-foreground-muted uppercase tracking-widest bg-transparent hover:bg-muted/30 rounded-full transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-4 text-[11px] font-black text-white uppercase tracking-widest bg-[#1c1c1e] rounded-full hover:bg-black focus:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-black/10">
                  {isSubmitting ? 'Provisioning...' : 'Deploy Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recent Platform Activity */}
      <div className="mt-20">
        <h2 className="text-2xl font-display font-black text-foreground uppercase tracking-tighter mb-10">Recent Platform Activity</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          <div className="lg:col-span-2 card-luxury overflow-hidden">
            <div className="divide-y divide-border-ios/10">
              {loadingActivities ? (
                <div className="px-8 py-12 text-center text-foreground-muted text-[11px] font-bold uppercase tracking-widest animate-pulse">Loading Logs...</div>
              ) : activities.length === 0 ? (
                <div className="px-8 py-12 text-center text-foreground-muted text-[11px] font-bold uppercase tracking-widest italic opacity-50">No recent activity</div>
              ) : (
                activities.map((log) => {
                  let config = { title: 'System Event', icon: Activity, color: 'text-foreground-muted', bg: 'bg-muted/30', shadow: 'shadow-muted/20' };
                  if (log.eventType === 'tenant_created') config = { title: 'New Tenant Provisioned', icon: Sparkles, color: 'text-accent', bg: 'bg-accent/10', shadow: 'shadow-accent/20' };
                  else if (log.eventType === 'tenant_suspended') config = { title: 'Tenant Suspended', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10', shadow: 'shadow-red-500/20' };
                  else if (log.eventType === 'tenant_activated') config = { title: 'Tenant Activated', icon: Shield, color: 'text-green-500', bg: 'bg-green-500/10', shadow: 'shadow-green-500/20' };
                  
                  return (
                    <div key={log.id} className="px-8 py-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                          config.bg, config.shadow
                        )}>
                          <config.icon className={cn("w-6 h-6", config.color)} />
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-foreground uppercase tracking-widest">{config.title}</p>
                          <p className="text-[11px] text-foreground-muted font-medium mt-0.5">{log.summary}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-foreground-muted/40 uppercase tracking-widest text-right">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            {/* TODO: Implement full audit log view at /superadmin/activity */}
            <button className="w-full py-4 bg-muted/20 text-[10px] font-black text-foreground-muted uppercase tracking-widest hover:bg-muted/40 transition-colors">View All Audit Logs</button>
          </div>

          <div className="space-y-6">
            <div className="card-luxury p-8 bg-foreground text-white border-none shadow-xl shadow-foreground/20">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Platform Health</p>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-bold">ALL SYSTEMS OPERATIONAL</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-medium border-b border-white/10 pb-2">
                   <span className="opacity-60">API Latency</span>
                   <span>42ms</span>
                </div>
                <div className="flex justify-between text-[11px] font-medium border-b border-white/10 pb-2">
                   <span className="opacity-60">Database Load</span>
                   <span>12%</span>
                </div>
                <div className="flex justify-between text-[11px] font-medium">
                   <span className="opacity-60">Pending Jobs</span>
                   <span>0</span>
                </div>
              </div>
            </div>

            <div className="card-luxury p-8">
               <p className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] mb-4">Quick Links</p>
               <div className="grid grid-cols-2 gap-3 text-left">
                  <button className="p-4 rounded-2xl bg-muted/30 text-[10px] font-black uppercase tracking-widest text-foreground block hover:bg-muted transition-colors">Documentation</button>
                  <button className="p-4 rounded-2xl bg-muted/30 text-[10px] font-black uppercase tracking-widest text-foreground block hover:bg-muted transition-colors">Support</button>
                  <button className="p-4 rounded-2xl bg-muted/30 text-[10px] font-black uppercase tracking-widest text-foreground block hover:bg-muted transition-colors">Billing</button>
                  <button className="p-4 rounded-2xl bg-muted/30 text-[10px] font-black uppercase tracking-widest text-foreground block hover:bg-muted transition-colors">Settings</button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
