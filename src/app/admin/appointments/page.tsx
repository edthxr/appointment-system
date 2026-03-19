'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { useSearchParams, useRouter } from 'next/navigation';
import Pagination from '@/components/Pagination';
import DataTable, { Column } from '@/components/DataTable';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/providers/LanguageProvider';

function AppointmentsContent() {
  const { t, locale } = useTranslation();
  const dateLocale = locale === 'th' ? th : enUS;

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('appointmentDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Detail Drawer State
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingIdParam = searchParams.get('bookingId');


  const clinicSlug = 'aura-premium';

  // Search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments?clinicSlug=${clinicSlug}&page=${page}&limit=${pageSize}&search=${debouncedSearch}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data);
        setTotal(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, clinicSlug, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Handle deep-linking
  useEffect(() => {
    if (bookingIdParam) {
      const found = appointments.find(a => a.id === bookingIdParam);
      if (found) {
        setSelectedAppointment(found);
        setIsDrawerOpen(true);
      } else {
        // If not in current page, we might need a separate fetch for just one booking
        const fetchOne = async () => {
          try {
            const res = await fetch(`/api/bookings/${bookingIdParam}?clinicSlug=${clinicSlug}`);
            if (!res.ok) {
              console.warn(`Booking fetch failed: ${res.status}`);
              return;
            }
            const data = await res.json();
            if (data.success && data.data) {
              setSelectedAppointment(data.data);
              setIsDrawerOpen(true);
            }
          } catch (err) {
            console.error('Failed to fetch specific booking:', err);
          }
        };
        fetchOne();
      }
    }
  }, [bookingIdParam, appointments, clinicSlug]);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    // Remove query param without refreshing
    const params = new URLSearchParams(searchParams.toString());
    params.delete('bookingId');
    router.replace(`/admin/appointments?${params.toString()}`);
  };


  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}?clinicSlug=${clinicSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        if (selectedAppointment?.id === id) {
          setSelectedAppointment({ ...selectedAppointment, status });
        }
      } else {
        alert(data.error || t('appointments.update_error'));
      }
    } catch (err) {
      alert(t('appointments.connection_error'));
    }
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const columns: Column<any>[] = [
    {
      header: t('appointments.col_customer'),
      accessorKey: 'userName',
      sortable: true,
      cell: (a) => (
        <div className="flex flex-col">
          <div className="font-bold text-foreground text-[13px] group-hover:text-accent transition-colors">{a.user?.name || t('appointments.unknown_client')}</div>
          <div className="text-[11px] text-foreground-muted mt-0.5">{a.user?.email}</div>
        </div>
      )
    },
    {
      header: t('appointments.col_service'),
      accessorKey: 'service',
      sortable: true,
      cell: (a) => (
        <span className="text-[12px] font-black text-foreground/80 tracking-tight uppercase">{a.service?.name || t('appointments.general_service')}</span>
      )
    },
    {
      header: t('appointments.col_schedule'),
      accessorKey: 'appointmentDate',
      sortable: true,
      cell: (a) => (
        <div className="flex flex-col">
          <div className="text-[12px] font-black text-foreground tracking-tight">{format(new Date(a.appointmentDate), 'dd MMM yyyy', { locale: dateLocale })}</div>
          <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mt-1">{a.startTime} – {a.endTime}</div>
        </div>
      )
    },
    {
      header: t('appointments.col_status'),
      accessorKey: 'status',
      sortable: true,
      cell: (a) => {
        const statusMap: Record<string, string> = {
          confirmed: t('appointments.status_confirmed'),
          completed: t('appointments.status_completed'),
          cancelled: t('appointments.status_cancelled'),
          pending: t('appointments.status_pending'),
        };
        return (
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            a.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100 shadow-sm shadow-green-100' : 
            a.status === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm shadow-blue-100' :
            a.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100 opacity-60' : 
            'bg-yellow-50 text-yellow-600 border-yellow-100 animate-pulse'
          }`}>
            {statusMap[a.status] || a.status}
          </span>
        );
      }
    },
    {
      header: t('appointments.col_control'),
      accessorKey: 'actions',
      className: 'text-center whitespace-nowrap',
      cell: (a) => (
        <div className="flex justify-center gap-2.5">
          {/* Details - Premium Glass Eye */}
          <button 
            onClick={() => {
              setSelectedAppointment(a);
              setIsDrawerOpen(true);
            }}
            className="group/tip relative flex items-center justify-center w-9 h-9 rounded-[14px] bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:bg-white hover:border-accent/40 hover:shadow-[0_8px_20px_-6px_rgba(212,175,55,0.3)] hover:-translate-y-0.5 transition-all duration-500 active:scale-95 cursor-pointer"
          >
            <svg className="w-[17px] h-[17px] text-accent/80 group-hover/tip:text-accent transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-foreground/90 backdrop-blur-xl text-white text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap opacity-0 scale-90 translate-x-2 group-hover/tip:opacity-100 group-hover/tip:scale-100 group-hover/tip:translate-x-0 transition-all duration-500 pointer-events-none shadow-2xl border border-white/10 z-20">
              {t('common.details')}
            </span>
          </button>

          {/* Confirm - Premium Glass Check */}
          {a.status === 'pending' && (
            <button 
              onClick={() => handleUpdateStatus(a.id, 'confirmed')}
              className="group/tip relative flex items-center justify-center w-9 h-9 rounded-[14px] bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:bg-white hover:border-emerald-500/40 hover:shadow-[0_8px_20px_-6px_rgba(34,197,94,0.25)] hover:-translate-y-0.5 transition-all duration-500 active:scale-95 cursor-pointer"
            >
              <svg className="w-[16px] h-[16px] text-emerald-500/80 group-hover/tip:text-emerald-600 transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
              </svg>
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-foreground/90 backdrop-blur-xl text-white text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap opacity-0 scale-90 translate-x-2 group-hover/tip:opacity-100 group-hover/tip:scale-100 group-hover/tip:translate-y-0 transition-all duration-500 pointer-events-none shadow-2xl border border-white/10 z-20">
                {t('appointments.verify')}
              </span>
            </button>
          )}

          {/* Cancel - Premium Glass X */}
          {a.status !== 'cancelled' && a.status !== 'completed' && (
            <button 
              onClick={() => handleUpdateStatus(a.id, 'cancelled')}
              className="group/tip relative flex items-center justify-center w-9 h-9 rounded-[14px] bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:bg-white hover:border-red-400/40 hover:shadow-[0_8px_20px_-6px_rgba(239,68,68,0.2)] hover:-translate-y-0.5 transition-all duration-500 active:scale-95 cursor-pointer"
            >
              <svg className="w-[15px] h-[15px] text-foreground-muted/50 group-hover/tip:text-red-500 transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-foreground/90 backdrop-blur-xl text-white text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap opacity-0 scale-90 translate-x-2 group-hover/tip:opacity-100 group-hover/tip:scale-100 group-hover/tip:translate-x-0 transition-all duration-500 pointer-events-none shadow-2xl border border-white/10 z-20">
                {t('appointments.void')}
              </span>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-display font-black text-foreground tracking-tighter mb-2" id="appointments-title">{t('appointments.title')}</h1>
          <p className="text-[13px] font-black text-accent uppercase tracking-[0.3em]">{t('appointments.subtitle')}</p>
        </div>
        <div className="text-[11px] font-black text-foreground-muted italic bg-muted px-4 py-2 rounded-full border border-border-ios">
          {t('appointments.showing_info').replace('{count}', String(appointments.length)).replace('{total}', String(total))}
        </div>
      </div>

      <div className="mb-8 max-w-md">
        <div className="relative group">
          <input
            id="search-appointments"
            type="text"
            placeholder={t('appointments.search_placeholder')}
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
              id="clear-search"
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

      <DataTable 
        columns={columns} 
        data={appointments} 
        loading={loading}
        sortKey={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      <div className="mt-10">
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

      {/* Appointment Detail Drawer */}
      {isDrawerOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeDrawer} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
            <div className="p-10">
              <div className="flex justify-between items-center mb-12">
                <button onClick={closeDrawer} className="p-2 -ml-2 text-foreground-muted hover:text-foreground transition-colors group">
                  <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                  selectedAppointment.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' : 
                  selectedAppointment.status === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                  selectedAppointment.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' : 
                  'bg-yellow-50 text-yellow-600 border-yellow-100'
                )}>
                  {selectedAppointment.status === 'confirmed' ? t('appointments.status_confirmed') : 
                   selectedAppointment.status === 'completed' ? t('appointments.status_completed') :
                   selectedAppointment.status === 'cancelled' ? t('appointments.status_cancelled') : t('appointments.status_pending')}
                </div>
              </div>

              <div className="space-y-12">
                <section>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-4">{t('appointments.patient_info')}</p>
                  <div className="flex items-center gap-6 mb-8 group">
                    <div className="w-16 h-16 rounded-3xl bg-foreground text-white flex items-center justify-center text-2xl font-black shadow-xl group-hover:scale-105 transition-transform duration-500">
                      {selectedAppointment.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-foreground tracking-tight">{selectedAppointment.user?.name || t('appointments.unknown_client')}</h2>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-sm text-foreground-muted flex items-center gap-2">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          {selectedAppointment.user?.email}
                        </p>
                        <p className="text-sm text-foreground-muted flex items-center gap-2">
                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                           {selectedAppointment.phoneNumber || t('common.no_data')}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-x-8 gap-y-10 bg-muted/20 p-8 rounded-[40px] border border-border-ios/20">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-2">{t('appointments.service_details')}</p>
                    <p className="text-sm font-black text-foreground uppercase tracking-tight">{selectedAppointment.service?.name || t('appointments.general_service')}</p>
                    <p className="text-[11px] text-foreground-muted mt-1">{selectedAppointment.service?.durationMin} {t('appointments.minutes')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-2">{t('sidebar.clinic_info')}</p>
                    <p className="text-sm font-black text-foreground uppercase tracking-tight">{selectedAppointment.clinic?.name || t('appointments.main_branch')}</p>
                    <p className="text-[11px] text-foreground-muted mt-1 uppercase tracking-widest">{selectedAppointment.clinicSlug}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-2">{t('appointments.schedule')}</p>
                    <p className="text-sm font-black text-foreground">{format(new Date(selectedAppointment.appointmentDate), 'EEEE, dd MMM yyyy', { locale: dateLocale })}</p>
                    <p className="text-[11px] font-bold text-accent uppercase tracking-[0.2em] mt-1">{selectedAppointment.startTime} – {selectedAppointment.endTime}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-2">{t('appointments.registered_on')}</p>
                    <p className="text-sm font-bold text-foreground">{format(new Date(selectedAppointment.createdAt), 'dd MMM yyyy', { locale: dateLocale })}</p>
                    <p className="text-[11px] text-foreground-muted mt-1">{format(new Date(selectedAppointment.createdAt), 'HH:mm:ss')}</p>
                  </div>
                </section>

                <section>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-4">{t('appointments.notes')}</p>
                  <div className="bg-white p-6 rounded-3xl border border-border-ios/50 shadow-inner">
                    <p className="text-sm text-foreground italic leading-relaxed">
                      {selectedAppointment.note || t('common.no_data')}
                    </p>
                  </div>
                </section>

                <section className="pt-8 flex flex-col gap-4">
                  <div className="flex gap-4">
                    {selectedAppointment.status === 'pending' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}
                        className="flex-1 bg-foreground text-white py-5 rounded-3xl text-[12px] font-black uppercase tracking-widest hover:bg-accent transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        {t('appointments.verify')}
                      </button>
                    )}
                    {selectedAppointment.status === 'confirmed' && (
                      <button 
                        onClick={() => handleUpdateStatus(selectedAppointment.id, 'completed')}
                        className="flex-1 bg-blue-600 text-white py-5 rounded-3xl text-[12px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {t('appointments.complete')}
                      </button>
                    )}
                  </div>
                  
                  {selectedAppointment.status !== 'cancelled' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                      className="w-full border border-border-ios/40 text-foreground-muted py-4 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95"
                    >
                      {t('appointments.void')}
                    </button>
                  )}
                </section>

                <div className="pt-8 border-t border-border-ios/10 flex flex-col items-center gap-1 opacity-40">
                  <p className="text-[9px] font-bold text-foreground-muted uppercase tracking-[0.3em]">System Record Hash</p>
                  <p className="text-[8px] font-mono text-foreground-muted truncate max-w-xs">{selectedAppointment.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapping with Suspense for useSearchParams
export default function AdminAppointmentsPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen font-black text-foreground uppercase tracking-widest opacity-40">{t('appointments.loading')}</div>}>
      <AppointmentsContent />
    </Suspense>
  );
}

