'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/appointments')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setBookings(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('คุณต้องการยกเลิกการนัดหมายนี้ใช่หรือไม่?')) return;

    try {
      const res = await fetch(`/api/bookings/${id}`, {
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
          Showing {bookings.length} exclusive visits
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
    </div>
  );
}
