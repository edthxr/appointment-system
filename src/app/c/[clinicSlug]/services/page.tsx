'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ServicesPage() {
  const params = useParams();
  const clinicSlug = params?.clinicSlug as string;
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinicSlug) return;
    
    fetch(`/api/services?clinicSlug=${clinicSlug}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setServices(res.data);
      })
      .finally(() => setLoading(false));
  }, [clinicSlug]);

  if (loading) return <div className="text-center py-10 text-gray-500">กำลังโหลด...</div>;

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-16">
        <h1 className="text-5xl font-display font-black text-foreground tracking-tighter mb-4">Aura Menu</h1>
        <p className="text-[14px] font-bold text-foreground-muted uppercase tracking-[0.3em]">Exclusive Aesthetic Procedures</p>
      </div>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div key={service.id} className="card-luxury flex flex-col group hover:border-accent/30">
            <div className="flex-1">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-display font-black text-foreground group-hover:text-accent transition-colors tracking-tight leading-tight">{service.name}</h3>
                <span className="bg-accent/10 text-accent text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-accent/20">Signature</span>
              </div>
              <p className="text-foreground-muted text-[13px] leading-relaxed mb-8 font-medium italic opacity-80">{service.description}</p>
              <div className="flex items-center text-foreground-muted/60 text-[11px] font-black uppercase tracking-widest">
                <svg className="w-4 h-4 mr-2 opacity-40 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {service.durationMin} MINS SESSION
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-border-ios/60 flex justify-between items-center">
              <div>
                <span className="text-[10px] block font-black text-foreground-muted uppercase tracking-widest mb-1 opacity-50">Starting from</span>
                <span className="text-3xl font-display font-black text-foreground tracking-tight leading-none">฿{Number(service.price).toLocaleString()}</span>
              </div>
              <Link
                href={`/booking?serviceId=${service.id}`}
                className="bg-foreground text-white px-8 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-foreground/80 hover:scale-105 transition-all active:scale-95"
              >
                Reserve
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
