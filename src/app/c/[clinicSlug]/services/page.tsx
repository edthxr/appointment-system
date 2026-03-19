'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/providers/LanguageProvider';
import Pagination from '@/components/Pagination';

export default function ServicesPage() {
  const { t } = useTranslation();
  const params = useParams();
  const clinicSlug = params?.clinicSlug as string;
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // Higher default for public view
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchServices = useCallback(async () => {
    if (!clinicSlug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/services?clinicSlug=${clinicSlug}&page=${page}&limit=${pageSize}&search=${debouncedSearch}`);
      const data = await res.json();
      if (data.success) {
        setServices(data.data);
        setTotal(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicSlug, page, pageSize, debouncedSearch]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  if (loading) return <div className="text-center py-20 text-foreground-muted font-bold animate-pulse">{t('common.loading')}</div>;

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-12">
        <h1 className="text-5xl font-display font-black text-foreground tracking-tighter mb-4">{t('services_public.title')}</h1>
        <p className="text-[14px] font-bold text-foreground-muted uppercase tracking-[0.3em] mb-8">{t('services_public.subtitle')}</p>
        
        <div className="max-w-md">
          <div className="relative group">
            <input
              type="text"
              placeholder={t('services_public.search_placeholder')}
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-border-ios shadow-sm focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all font-medium text-[13px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg 
              className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted group-focus-within:text-accent transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 mb-16">
        {services.map((service) => (
          <div key={service.id} className="card-luxury flex flex-col group hover:border-accent/30">
            <div className="flex-1">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-display font-black text-foreground group-hover:text-accent transition-colors tracking-tight leading-tight">{service.name}</h3>
                <span className="bg-accent/10 text-accent text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-accent/20">{t('services_public.signature')}</span>
              </div>
              <p className="text-foreground-muted text-[13px] leading-relaxed mb-8 font-medium italic opacity-80">{service.description}</p>
              <div className="flex items-center text-foreground-muted/60 text-[11px] font-black uppercase tracking-widest">
                <svg className="w-4 h-4 mr-2 opacity-40 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('services_public.duration_template', { duration: service.durationMin })}
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-border-ios/60 flex justify-between items-center">
              <div>
                <span className="text-[10px] block font-black text-foreground-muted uppercase tracking-widest mb-1 opacity-50">{t('services_public.starting_from')}</span>
                <span className="text-3xl font-display font-black text-foreground tracking-tight leading-none">฿{Number(service.price).toLocaleString()}</span>
              </div>
              <Link
                href={`/c/${clinicSlug}/booking?serviceId=${service.id}`}
                className="bg-foreground text-white px-8 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-foreground/80 hover:scale-105 transition-all active:scale-95"
              >
                {t('services_public.reserve_btn')}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {services.length > 0 && (
        <div className="card-luxury p-0 overflow-hidden border-border-ios/60">
          <Pagination 
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
