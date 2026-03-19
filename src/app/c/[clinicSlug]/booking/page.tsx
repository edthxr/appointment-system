'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { format, addDays } from 'date-fns';
import { useTranslation } from '@/providers/LanguageProvider';

function BookingContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const params = useParams();
  const clinicSlug = params?.clinicSlug as string;
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
    if (!clinicSlug) return;
    fetch(`/api/services?clinicSlug=${clinicSlug}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setServices(res.data);
      });
  }, [clinicSlug]);

  useEffect(() => {
    if (selectedService && selectedDate && clinicSlug) {
      setLoading(true);
      fetch(`/api/bookings?serviceId=${selectedService}&date=${selectedDate}&clinicSlug=${clinicSlug}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success) setSlots(res.data);
          else setSlots([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedService, selectedDate, clinicSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedSlot || !clinicSlug) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicSlug,
          serviceId: selectedService,
          appointmentDate: selectedDate,
          startTime: selectedSlot,
          note,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/c/${clinicSlug}/my-bookings`);
      } else {
        alert(data.error || t('booking.error_failed'));
      }
    } catch (error) {
      alert(t('booking.error_connection'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-5xl font-display font-black text-foreground tracking-tighter mb-3">{t('booking.title')}</h1>
        <p className="text-[13px] font-bold text-foreground-muted uppercase tracking-[0.3em]">{t('booking.subtitle')}</p>
      </div>

      <div className="card-luxury p-10 md:p-16 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="animate-in slide-in-from-bottom-2 duration-500">
            <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] mb-4">{t('booking.step_1')}</label>
            <select 
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full h-16 px-6 text-[15px] font-bold"
              required
            >
              <option value="">{t('booking.select_service_placeholder')}</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} (฿{Number(s.price).toLocaleString()})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4 border-t border-border-ios/40 animate-in slide-in-from-bottom-4 duration-700">
            <div>
              <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] mb-4">{t('booking.step_2')}</label>
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
              <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] mb-4">{t('booking.step_3')}</label>
              {loading ? (
                <div className="h-16 flex items-center px-2 text-foreground-muted text-[12px] font-bold uppercase tracking-widest italic animate-pulse">{t('booking.loading_slots')}</div>
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
                <div className="h-16 flex items-center px-2 text-red-400 text-[12px] font-bold uppercase tracking-widest">{t('booking.no_slots')}</div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border-ios/40 animate-in slide-in-from-bottom-6 duration-700">
            <label className="block text-[10px] font-black text-foreground-muted uppercase tracking-[0.2em] mb-4">{t('booking.note_label')}</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('booking.note_placeholder')}
              className="w-full h-32 p-6 text-[14px] font-medium italic"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedSlot}
            className="w-full bg-foreground text-white py-6 px-4 rounded-full font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl hover:bg-foreground/90 disabled:bg-muted disabled:text-foreground-muted/40 disabled:shadow-none transition-all active:scale-[0.98] mt-4"
          >
            {submitting ? t('booking.submitting') : t('booking.btn_submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function BookingPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-40 animate-pulse">
        <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-6"></div>
        <p className="text-[11px] font-black text-foreground-muted uppercase tracking-[0.3em]">{t('booking.preparing')}</p>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
