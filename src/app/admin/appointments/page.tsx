'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const clinicSlug = 'aura-premium';

  useEffect(() => {
    fetch(`/api/appointments?clinicSlug=${clinicSlug}`)
      .then(res => res.json())
      .then(res => { if (res.success) setAppointments(res.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}?clinicSlug=${clinicSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
      } else {
        alert(data.error || 'ไม่สามารถอัปเดตสถานะได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-display font-black text-foreground tracking-tighter mb-2">Appointments</h1>
          <p className="text-[13px] font-bold text-foreground-muted uppercase tracking-widest">Client Service Masterlist</p>
        </div>
        <div className="text-[11px] font-black text-foreground-muted italic bg-muted px-4 py-2 rounded-full border border-border-ios">
          Showing {appointments.length} scheduled visits
        </div>
      </div>

      <div className="card-luxury p-0 overflow-hidden border-border-ios/60">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-ios">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Customer Details</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Service</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Schedule</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em]">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-ios bg-white">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-foreground-muted text-[12px] font-medium italic">Synchronizing database...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-foreground-muted text-[12px] font-medium italic">No scheduled appointments found</td></tr>
              ) : appointments.map((a) => (
                <tr key={a.id} className="hover:bg-surface transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="font-bold text-foreground text-[13px] group-hover:text-accent transition-colors">{a.user?.name}</div>
                    <div className="text-[11px] text-foreground-muted mt-0.5">{a.user?.email}</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="text-[12px] font-black text-foreground/80 tracking-tight uppercase">{a.service?.name}</span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-[12px] font-black text-foreground tracking-tight">{format(new Date(a.appointmentDate), 'dd MMM yyyy')}</div>
                    <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mt-1">{a.startTime} – {a.endTime}</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      a.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' : 
                      a.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' : 
                      'bg-yellow-50 text-yellow-600 border-yellow-100'
                    }`}>
                      {a.status === 'confirmed' ? 'Verified' : 
                       a.status === 'cancelled' ? 'Voided' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end gap-6">
                      {a.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(a.id, 'confirmed')}
                          className="text-[10px] font-black text-green-600 hover:text-green-800 uppercase tracking-widest transition-all hover:scale-110"
                        >
                          Verify
                        </button>
                      )}
                      {a.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleUpdateStatus(a.id, 'cancelled')}
                          className="text-[10px] font-black text-foreground-muted hover:text-red-500 uppercase tracking-widest transition-all hover:scale-110"
                        >
                          Void
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
