import { redirect } from 'next/navigation';
import { resolveActiveClinic } from '@/lib/clinic-resolver';
import { registry } from '@/lib/registry';

export default async function AdminDashboard() {
  const activeClinic = await resolveActiveClinic();
  
  if (!activeClinic) {
    redirect('/admin/select-clinic');
  }

  const stats = await registry.bookingRepo.getStats(activeClinic.id);

  return (
    <div className="animate-in fade-in duration-1000">
      <div className="mb-12">
        <h1 className="text-5xl font-display font-black text-foreground tracking-tighter mb-2">Management Workspace</h1>
        <p className="text-[13px] font-black text-accent uppercase tracking-[0.3em]">{activeClinic.name} Performance Overview</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="card-luxury p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Total Appointments</p>
            <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center border border-border-ios/40 text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-6xl font-display font-black text-foreground tracking-tighter">{stats.totalAppointments}</p>
          <p className="text-[11px] text-green-600 font-bold mt-4 flex items-center gap-1">
            <span className="bg-green-100 px-1.5 py-0.5 rounded-md">↑ 12%</span>
            <span className="opacity-60 uppercase tracking-widest text-[9px]">vs last month</span>
          </p>
        </div>

        <div className="card-luxury p-8 border-accent/10">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Pending Requests</p>
            <div className="w-10 h-10 rounded-2xl bg-accent/5 flex items-center justify-center border border-accent/10 text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-6xl font-display font-black text-foreground tracking-tighter">{stats.pendingAppointments}</p>
          <p className="text-[11px] text-foreground-muted font-bold mt-4 uppercase tracking-widest opacity-60">Awaiting Confirmation</p>
        </div>

        <div className="card-luxury p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Est. Gross Revenue</p>
            <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center border border-border-ios/40 text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 1.254-3 2.8s1.343 2.8 3 2.8 3 1.254 3 2.8-1.343 2.8-3 2.8m0-11.2V3m0 16v-5m0-1c-1.657 0-3-1.254-3-2.8s1.343-2.8 3-2.8 3 1.254 3 2.8-1.343 2.8-3 2.8" />
              </svg>
            </div>
          </div>
          <p className="text-6xl font-display font-black text-foreground tracking-tighter">฿{stats.estimatedRevenue >= 1000 ? `${(stats.estimatedRevenue / 1000).toFixed(1)}K` : stats.estimatedRevenue}</p>
          <p className="text-[11px] text-green-600 font-bold mt-4 flex items-center gap-1">
            <span className="bg-green-100 px-1.5 py-0.5 rounded-md">↑ 8.4%</span>
            <span className="opacity-60 uppercase tracking-widest text-[9px]">Calculated yield</span>
          </p>
        </div>

        <div className="card-luxury p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Cancelled Orders</p>
            <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center border border-border-ios/40 text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <p className="text-6xl font-display font-black text-foreground tracking-tighter">{stats.cancelledAppointments}</p>
          <p className="text-[11px] text-red-500/60 font-bold mt-4 uppercase tracking-widest opacity-80">Requires Review</p>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
           <h2 className="text-2xl font-display font-black mb-10 text-foreground uppercase tracking-tighter">Clinical Performance Log</h2>
           <div className="card-luxury min-h-[400px] flex flex-col items-center justify-center border-dashed border-2 bg-muted/20 opacity-80">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg mb-6 border border-border-ios/40 text-accent/40">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 </svg>
              </div>
              <p className="text-foreground-muted text-[13px] font-black uppercase tracking-[0.3em] italic opacity-40">
                Awaiting more historical throughput to generate charts
              </p>
           </div>
        </div>

        <div className="space-y-10">
           <h2 className="text-2xl font-display font-black mb-10 text-foreground uppercase tracking-tighter">Market Pulse</h2>
           <div className="card-luxury p-8">
              <p className="text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] mb-8">Service Popularity Index</p>
              <div className="space-y-6">
                 {stats.popularServices.length === 0 ? (
                    <p className="text-[11px] text-foreground-muted font-bold italic opacity-60 uppercase tracking-widest py-8 text-center border border-dashed border-border-ios/40 rounded-2xl">Insufficient data</p>
                 ) : (
                    stats.popularServices.map((service, i) => (
                       <div key={i} className="flex items-center justify-between group">
                          <div className="space-y-1">
                             <p className="text-[13px] font-black text-foreground uppercase tracking-widest">{service.name}</p>
                             <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                                <div 
                                   className="h-full bg-accent transition-all duration-1000 ease-out" 
                                   style={{ width: `${Math.min(100, (service.count / stats.totalAppointments) * 100)}%` }}
                                />
                             </div>
                          </div>
                          <p className="text-xl font-display font-black text-accent">{service.count}</p>
                       </div>
                    ))
                 )}
              </div>
           </div>

           <div className="card-luxury p-8 bg-accent/5 border-accent/10">
              <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-4">Quick Optimization</p>
              <p className="text-[12px] font-medium text-foreground-muted leading-relaxed mb-6 opacity-80 italic">
                 "You are currently seeing a 15% drop in bookings during mid-week slots. Consider launching a 'Wellness Wednesday' campaign."
              </p>
              <button className="w-full text-[10px] font-black text-accent border border-accent/20 bg-white py-4 rounded-2xl uppercase tracking-[0.2em] shadow-sm hover:bg-accent hover:text-white transition-all">
                 Generate Campaign
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
