'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/providers/LanguageProvider';

export default function HomePage() {
  const params = useParams();
  const clinicSlug = params?.clinicSlug as string;
  const { t } = useTranslation();

  if (clinicSlug === 'aura-premium' || clinicSlug === 'aura') {
    return (
      <div className="bg-white min-h-screen selection:bg-black selection:text-white">
        {/* Cinematic Hero Section */}
        <section className="relative flex flex-col items-center justify-center pt-48 pb-32 text-center overflow-hidden">
          <div className="inline-block px-4 py-1.5 mb-12 border border-black/10 rounded-full animate-in fade-in slide-in-from-top-6 duration-1000">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/50">
              {t('home.hero_badge') || "Establishment No. 01"}
            </span>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-7xl md:text-[10rem] font-black font-epilogue leading-[0.85] tracking-tighter text-black mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              The Art of <br />
              <span className="text-black/10">Radiance.</span>
            </h1>
          </div>
          
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-black/60 font-medium leading-relaxed mb-20 animate-in fade-in duration-1000 delay-300 px-6">
            Where clinical precision meets the poetry of aesthetic architecture. <br className="hidden md:block" />
            A sanctuary dedicated to the elevation of your most authentic self.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center animate-in fade-in duration-1000 delay-500">
            <Link
              href={`/c/${clinicSlug}/booking`}
              className="group relative w-full sm:w-auto bg-black text-white px-16 py-6 text-[11px] font-bold uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">{t('home.reservation') || "Secure Your Journey"}</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Link>
            <Link
              href={`/c/${clinicSlug}/services`}
              className="w-full sm:w-auto bg-transparent text-black px-16 py-6 border border-black/20 text-[11px] font-bold uppercase tracking-[0.3em] hover:border-black hover:bg-black hover:text-white transition-all"
            >
              {t('home.explore_menu') || "The Collection"}
            </Link>
          </div>

          {/* Background Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.015]">
            <span className="text-[40vw] font-black font-epilogue uppercase whitespace-nowrap">
              Aura
            </span>
          </div>
        </section>

        {/* Narrative Section */}
        <section className="py-32 border-t border-black/5">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-baseline justify-between mb-32 gap-12">
              <div className="max-w-2xl">
                <h2 className="text-5xl md:text-7xl font-black font-epilogue tracking-tighter text-black mb-10 leading-tight">
                  Clinical <br /> Excellence, <br /> Redefined.
                </h2>
                <div className="h-1 w-24 bg-black mb-10" />
              </div>
              <div className="max-w-md text-right md:text-left self-end">
                <p className="text-black/60 text-lg font-medium leading-relaxed italic">
                  "Beauty is not merely visual; it is an architectural harmony between science and soul. At Aura, we design outcomes that reflect your innate elegance."
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { 
                  id: "01", 
                  title: "Diagnostic Precision", 
                  desc: "Utilizing advanced skin-mapping technology to craft your unique dermatological blueprint.",
                  tag: "Intelligence"
                },
                { 
                  id: "02", 
                  title: "Refined Artistry", 
                  desc: "Bespoke injectables and therapies that respect the natural structure of your features.",
                  tag: "Craftsmanship"
                },
                { 
                  id: "03", 
                  title: "Luminous Path", 
                  desc: "A holistic recovery and maintenance program tailored to sustain your radiant baseline.",
                  tag: "Endurance"
                }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="group p-16 bg-[#FAFAFA] border border-black/5 rounded-[3rem] transition-all duration-1000 hover:bg-black cursor-pointer overflow-hidden relative"
                >
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/30 group-hover:text-white/30 mb-20 transition-colors">
                      {item.tag} // Section {item.id}
                    </div>
                    <h3 className="text-3xl font-black font-epilogue tracking-tight text-black group-hover:text-white mb-8 transition-colors leading-none">
                      {item.title}
                    </h3>
                    <p className="text-black/50 group-hover:text-white/50 font-medium leading-relaxed transition-colors mb-12">
                      {item.desc}
                    </p>
                    <div className="mt-auto pt-8 flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-black group-hover:text-white transition-all">
                      Explore Treatment
                      <span className="ml-4 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">→</span>
                    </div>
                  </div>
                  {/* Subtle hover reveal */}
                  <div className="absolute -bottom-10 -right-10 text-9xl font-black font-epilogue text-white/5 group-hover:text-white/5 transition-all duration-1000 rotate-12">
                    {item.id}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Experience */}
        <section className="py-48 bg-black text-white text-center overflow-hidden relative">
          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-5xl md:text-8xl font-black font-epilogue tracking-tighter mb-12">
              Begin Your <br /> Transformation.
            </h2>
            <Link
              href={`/c/${clinicSlug}/booking`}
              className="inline-block px-20 py-8 bg-white text-black text-[12px] font-black uppercase tracking-[0.5em] hover:scale-110 active:scale-95 transition-all"
            >
              Book Consultation
            </Link>
          </div>
          {/* Animated Watermark in Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <span className="text-[50vw] font-black font-epilogue uppercase animate-pulse">
              Aura
            </span>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-1000">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-24 md:py-40 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-8 animate-in slide-in-from-top-4 duration-700">
          <span className="text-[10px] font-black text-accent uppercase tracking-[0.4em]">{t('home.hero_badge')}</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-display font-black text-foreground tracking-tighter leading-[0.9] mb-8 animate-in slide-in-from-bottom-4 duration-700">
          {t('home.hero_title_main')} <br />
          <span className="text-accent underline decoration-border-ios underline-offset-8">{t('home.hero_title_accent')}</span>
        </h1>
        <p className="max-w-xl mx-auto text-[15px] md:text-[17px] text-foreground-muted font-medium italic leading-relaxed mb-12 opacity-80 animate-in fade-in duration-1000 delay-300">
          {t('home.hero_description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-in fade-in duration-1000 delay-500">
          <Link
            href={`/c/${clinicSlug}/services`}
            className="w-full sm:w-auto bg-foreground text-white px-12 py-5 rounded-full text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-foreground/80 hover:scale-105 transition-all active:scale-95"
          >
            {t('home.explore_menu')}
          </Link>
          <Link
            href={`/c/${clinicSlug}/booking`}
            className="w-full sm:w-auto bg-transparent text-foreground px-12 py-5 rounded-full text-[12px] font-black uppercase tracking-[0.3em] border border-border-ios hover:bg-surface transition-all"
          >
            {t('home.reservation')}
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
          <h3 className="text-xl font-display font-black mb-4 uppercase tracking-tighter">{t('home.philosophy_1_title')}</h3>
          <p className="text-[13px] text-foreground-muted leading-relaxed font-medium italic opacity-70">
            {t('home.philosophy_1_desc')}
          </p>
        </div>

        <div className="card-luxury text-center hover:border-accent/20 transition-all group">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-accent mb-8 mx-auto border border-border-ios group-hover:bg-accent group-hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-black mb-4 uppercase tracking-tighter">{t('home.philosophy_2_title')}</h3>
          <p className="text-[13px] text-foreground-muted leading-relaxed font-medium italic opacity-70">
            {t('home.philosophy_2_desc')}
          </p>
        </div>

        <div className="card-luxury text-center hover:border-accent/20 transition-all group">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-accent mb-8 mx-auto border border-border-ios group-hover:bg-accent group-hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.952 11.952 0 0112 15c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 013 12c0-.778.099-1.533.284-2.253" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-black mb-4 uppercase tracking-tighter">{t('home.philosophy_3_title')}</h3>
          <p className="text-[13px] text-foreground-muted leading-relaxed font-medium italic opacity-70">
            {t('home.philosophy_3_desc')}
          </p>
        </div>
      </section>
    </div>
  );
}
