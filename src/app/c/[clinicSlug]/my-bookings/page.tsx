'use client';

import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';
import Pagination from '@/components/Pagination';

export default function MyBookingsPage() {
  const params = useParams();
  const clinicSlug = params?.clinicSlug as string;
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
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

  const fetchBookings = useCallback(async () => {
    if (!clinicSlug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments?clinicSlug=${clinicSlug}&page=${page}&limit=${pageSize}&search=${debouncedSearch}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
        setTotal(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicSlug, page, pageSize, debouncedSearch]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (id: string) => {
    if (!confirm('คุณต้องการยกเลิกการนัดหมายนี้ใช่หรือไม่?')) return;

    try {
      const res = await fetch(`/api/bookings/${id}?clinicSlug=${clinicSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings(bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)));
      } else {
        alert(data.error || 'ไม่สามารถยกเลิกนัดได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-display font-black text-foreground tracking-tighter mb-2">My Appointments</h1>
          <p className="text-[13px] font-bold text-foreground-muted uppercase tracking-widest">Personal Treatment Schedule</p>
        </div>
        <div className="text-[11px] font-black text-foreground-muted italic bg-muted px-4 py-2 rounded-full border border-border-ios">
          Showing {bookings.length} of {total} exclusive visits
        </div>
      </div>

      <div className="mb-12 max-w-md">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search your appointments..."
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
      
      {bookings.length === 0 ? (
        <div className="card-luxury py-24 text-center border-dashed border-2 bg-muted/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg className="w-6 h-6 text-foreground-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-foreground-muted text-[13px] font-bold uppercase tracking-widest">No scheduled visits yet</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {bookings.map((booking) => (
            <div key={booking.id} className="card-luxury flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-accent/30">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-2xl font-display font-black text-foreground tracking-tighter group-hover:text-accent transition-colors">{booking.service?.name}</h3>
                  {booking.status === 'confirmed' && (
                    <span className="text-[9px] bg-accent/10 text-accent px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] border border-accent/20">Verified</span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border-ios group-hover:bg-accent/5 group-hover:border-accent/10 transition-colors">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] text-foreground-muted uppercase font-black tracking-widest mb-1">Date</div>
                      <div className="font-bold text-foreground text-[14px]">{format(new Date(booking.appointmentDate), 'dd MMM yyyy')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border-ios group-hover:bg-accent/5 group-hover:border-accent/10 transition-colors">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] text-foreground-muted uppercase font-black tracking-widest mb-1">Time</div>
                      <div className="font-bold text-foreground text-[14px] tracking-tight">{booking.startTime} – {booking.endTime}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-10 pt-8 md:pt-0 border-t md:border-t-0 border-border-ios">
                <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  booking.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' :
                  booking.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                  'bg-yellow-50 text-yellow-600 border-yellow-100'
                }`}>
                  {booking.status === 'confirmed' ? 'Verified' : booking.status === 'cancelled' ? 'Voided' : 'Pending'}
                </span>
                
                {(booking.status === 'pending' || booking.status === 'confirmed') ? (
                  <button 
                    onClick={() => handleCancel(booking.id)}
                    className="text-[10px] font-black text-foreground-muted/40 hover:text-red-500 transition-all uppercase tracking-widest hover:scale-110"
                  >
                    Void Appt
                  </button>
                ) : (
                  <div className="w-20"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {bookings.length > 0 && (
        <div className="mt-12 card-luxury p-0 overflow-hidden border-border-ios/60">
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
