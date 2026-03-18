export default function AdminCalendarPage() {
  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-black text-foreground tracking-tighter mb-2">Treatment Schedule</h1>
        <p className="text-[13px] font-bold text-foreground-muted uppercase tracking-widest">Procedural Calendar Overview</p>
      </div>

      <div className="card-luxury py-32 text-center border-dashed border-2 bg-muted/30">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
          <svg className="w-6 h-6 text-foreground-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-display font-black text-foreground mb-4 uppercase tracking-tighter">Calendar Node Offline</h2>
        <p className="text-foreground-muted text-[13px] font-medium leading-relaxed max-w-sm mx-auto italic opacity-70">
          The procedural calendar interface is currently under optimization. 
          Please utilize the <span className="text-accent font-bold">Appointments</span> module for registry management.
        </p>
      </div>
    </div>
  );
}
