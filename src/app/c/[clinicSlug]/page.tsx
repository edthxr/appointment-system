'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function HomePage() {
  const params = useParams();
  const clinicSlug = params?.clinicSlug as string;

  return (
    <div className="animate-in fade-in duration-1000">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-24 md:py-40 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-8 animate-in slide-in-from-top-4 duration-700">
          <span className="text-[10px] font-black text-accent uppercase tracking-[0.4em]">The New Standard of Beauty</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-display font-black text-foreground tracking-tighter leading-[0.9] mb-8 animate-in slide-in-from-bottom-4 duration-700">
          Elevate Your <br />
          <span className="text-accent underline decoration-border-ios underline-offset-8">Radiance</span>
        </h1>
        <p className="max-w-xl mx-auto text-[15px] md:text-[17px] text-foreground-muted font-medium italic leading-relaxed mb-12 opacity-80 animate-in fade-in duration-1000 delay-300">
          Experience a harmony of medical precision and artistic vision. 
          Aura Clinic invites you to a sanctuary where luxury meets transformative aesthetic care.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-in fade-in duration-1000 delay-500">
          <Link
            href={`/c/${clinicSlug}/services`}
            className="w-full sm:w-auto bg-foreground text-white px-12 py-5 rounded-full text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-foreground/80 hover:scale-105 transition-all active:scale-95"
          >
            Explore Menu
          </Link>
          <Link
            href={`/c/${clinicSlug}/booking`}
            className="w-full sm:w-auto bg-transparent text-foreground px-12 py-5 rounded-full text-[12px] font-black uppercase tracking-[0.3em] border border-border-ios hover:bg-surface transition-all"
          >
            Reservation
          </Link>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-10 py-20 border-t border-border-ios/40">
        <div className="card-luxury text-center hover:border-accent/20 transition-all group">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-accent mb-8 mx-auto border border-border-ios group-hover:bg-accent group-hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-black mb-4 uppercase tracking-tighter">Bespoke Timing</h3>
          <p className="text-[13px] text-foreground-muted leading-relaxed font-medium italic opacity-70">
            Tailored scheduling designed around your lifestyle. Minimized wait times, maximized attention.
          </p>
        </div>

        <div className="card-luxury text-center hover:border-accent/20 transition-all group">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-accent mb-8 mx-auto border border-border-ios group-hover:bg-accent group-hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-black mb-4 uppercase tracking-tighter">Clinical Artistry</h3>
          <p className="text-[13px] text-foreground-muted leading-relaxed font-medium italic opacity-70">
            Procedures performed by expert practitioners where medical safety meets sophisticated aesthetics.
          </p>
        </div>

        <div className="card-luxury text-center hover:border-accent/20 transition-all group">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-accent mb-8 mx-auto border border-border-ios group-hover:bg-accent group-hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.952 11.952 0 0112 15c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 013 12c0-.778.099-1.533.284-2.253" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-black mb-4 uppercase tracking-tighter">Global Standards</h3>
          <p className="text-[13px] text-foreground-muted leading-relaxed font-medium italic opacity-70">
            A sanctuary of hygiene and innovation. Utilizing industry-leading technology for superior results.
          </p>
        </div>
      </section>
    </div>
  );
}
