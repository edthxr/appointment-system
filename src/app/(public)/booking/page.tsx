'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format, addDays } from 'date-fns';

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialServiceId = searchParams.get('serviceId') || '';

  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState(initialServiceId);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setServices(res.data);
      });
  }, []);

  useEffect(() => {
    if (selectedService && selectedDate) {
      setLoading(true);
      fetch(`/api/bookings?serviceId=${selectedService}&date=${selectedDate}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success) setSlots(res.data);
          else setSlots([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedService, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedSlot) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService,
          appointmentDate: selectedDate,
          startTime: selectedSlot,
          note,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/my-bookings');
      } else {
        alert(data.error || 'Reservation failed. Please try again.');
      }
    } catch (error) {
      alert('Connection error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-5xl font-display font-black text-foreground tracking-tighter mb-3">Reservation</h1>
        <p className="text-[13px] font-bold text-foreground-muted uppercase tracking-[0.3em]">Curate Your Clinical Experience</p>
      </div>

      <div className="card-luxury p-10 md:p-16 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="animate-in slide-in-from-bottom-2 duration-500">
            <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] mb-4">Step 01: Select Procedure</label>
            <select 
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full h-16 px-6 text-[15px] font-bold"
              required
            >
              <option value="">— Select from our procedural menu —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} (฿{Number(s.price).toLocaleString()})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4 border-t border-border-ios/40 animate-in slide-in-from-bottom-4 duration-700">
            <div>
              <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] mb-4">Step 02: Preference Date</label>
              <input 
                type="date" 
                min={format(new Date(), 'yyyy-MM-dd')}
                max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full h-16 px-6 text-[15px] font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] mb-4">Step 03: Exclusive Slots</label>
              {loading ? (
                <div className="h-16 flex items-center px-2 text-foreground-muted text-[12px] font-bold uppercase tracking-widest italic animate-pulse">Synchronizing slots...</div>
              ) : slots.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`h-12 text-[11px] font-black rounded-xl border transition-all active:scale-95 ${
                        selectedSlot === slot 
                          ? 'bg-accent text-white border-accent shadow-md shadow-accent/20' 
                          : 'bg-muted text-foreground/60 border-border-ios hover:border-accent/40'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="h-16 flex items-center px-2 text-red-400 text-[12px] font-bold uppercase tracking-widest">No availability on this date</div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border-ios/40 animate-in slide-in-from-bottom-6 duration-700">
            <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] mb-4">Concierge Notes (Optional)</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any specific requests for our practitioners..."
              className="w-full h-32 p-6 text-[14px] font-medium italic"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedSlot}
            className="w-full bg-foreground text-white py-6 px-4 rounded-full font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl hover:bg-foreground/90 disabled:bg-muted disabled:text-foreground-muted/40 disabled:shadow-none transition-all active:scale-[0.98] mt-4"
          >
            {submitting ? 'Authenticating Reservation...' : 'Complete Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-40 animate-pulse">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-6"></div>
        <p className="text-[11px] font-black text-foreground-muted uppercase tracking-[0.3em]">Preparing Concierge...</p>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
