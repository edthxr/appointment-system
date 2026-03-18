export default function AdminSettingsPage() {
  const days = [
    { th: 'อาทิตย์', en: 'Sunday' },
    { th: 'จันทร์', en: 'Monday' },
    { th: 'อังคาร', en: 'Tuesday' },
    { th: 'พุธ', en: 'Wednesday' },
    { th: 'พฤหัสบดี', en: 'Thursday' },
    { th: 'ศุกร์', en: 'Friday' },
    { th: 'เสาร์', en: 'Saturday' }
  ];

  return (
    <div className="max-w-4xl animate-in fade-in duration-700">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-black text-foreground tracking-tighter mb-2">Clinical Protocol</h1>
        <p className="text-[13px] font-bold text-foreground-muted uppercase tracking-widest">Global System Configurations</p>
      </div>

      <div className="card-luxury p-0 overflow-hidden divide-y divide-border-ios/40">
        <div className="p-10 md:p-12">
          <h2 className="text-xl font-display font-black mb-8 uppercase tracking-tighter">Practitioner Hours</h2>
          <div className="space-y-4">
            {days.map((day) => (
              <div key={day.en} className="flex items-center justify-between text-[13px]">
                <span className="w-32 font-black text-foreground-muted uppercase tracking-widest opacity-60">{day.en}</span>
                <div className="flex items-center gap-6">
                  <span className="font-bold text-foreground tracking-tight">09:00 — 18:00</span>
                  <span className="text-[10px] bg-green-50 text-green-600 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-green-100">Operational</span>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-10 text-[11px] font-black text-accent uppercase tracking-[0.2em] hover:opacity-70 transition-all">
            Modify Operating Schedule
          </button>
        </div>

        <div className="p-10 md:p-12">
          <h2 className="text-xl font-display font-black mb-6 uppercase tracking-tighter">Reserved Vacancies</h2>
          <div className="text-[12px] text-foreground-muted italic mb-8 opacity-60">No blackout periods currently active.</div>
          <button className="bg-foreground text-white px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-foreground/80 transition-all shadow-lg active:scale-95">
            + Schedule Blocked Slot
          </button>
        </div>

        <div className="p-10 md:p-12 bg-red-50/20">
          <h2 className="text-xl font-display font-black mb-6 text-red-900 uppercase tracking-tighter">Registry Purge</h2>
          <p className="text-[11px] text-red-800/60 font-medium mb-8 leading-relaxed italic">
            Caution: Initiating a purge will permanently remove all historical appointment data from the encrypted registry. This action is irreversible.
          </p>
          <button className="text-red-600 text-[10px] font-black border border-red-200 bg-white px-8 py-3.5 rounded-full hover:bg-red-50 transition-all uppercase tracking-widest active:scale-95">
            Wipe Appointment Registry
          </button>
        </div>
      </div>
    </div>
  );
}
