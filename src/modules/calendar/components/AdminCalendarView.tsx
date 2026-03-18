'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, setMonth, setYear } from 'date-fns';
import { th } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  date: string;
  appointments: Array<{
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    user?: { name: string };
    service?: { name: string };
  }>;
}

interface AdminCalendarViewProps {
  clinicSlug: string;
  clinicName: string;
}

export default function AdminCalendarView({ clinicSlug, clinicName }: AdminCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showPicker, setShowPicker] = useState<'month' | 'year' | null>(null);
  const [yearRangeStart, setYearRangeStart] = useState(new Date().getFullYear() - 5);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/calendar?date=${format(currentDate, 'yyyy-MM-dd')}&view=month&clinicSlug=${clinicSlug}`);
      const data = await response.json();
      if (data.success) {
        setEvents(data.data.appointments);
      }
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.find(event => event.date === dateStr);
  };

  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  
  const years = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => yearRangeStart + i);
  }, [yearRangeStart]);

  const handleYearChange = (year: number) => {
    setCurrentDate(setYear(currentDate, year));
    setShowPicker(null);
  };

  const handleMonthChange = (monthIndex: number) => {
    setCurrentDate(setMonth(currentDate, monthIndex));
    setShowPicker(null);
  };

  return (
    <div className="animate-in fade-in duration-700 min-h-screen pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-display font-black text-foreground tracking-tighter mb-2">ปฏิทินนัดหมาย</h1>
          <p className="text-[13px] font-bold text-foreground-muted uppercase tracking-[0.2em]">{clinicName} • Scheduling</p>
        </div>
        
        <div className="flex items-center bg-muted/50 p-1.5 rounded-full border border-border-ios backdrop-blur-sm shadow-sm self-start md:self-auto">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-3 text-foreground-muted hover:text-accent hover:bg-white rounded-full transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-6 py-2.5 bg-white text-foreground text-[11px] font-black uppercase tracking-widest rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all border border-border-ios/50"
          >
            Today
          </button>
          
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-3 text-foreground-muted hover:text-accent hover:bg-white rounded-full transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calendar View */}
        <div className="lg:col-span-8 card-luxury p-0! overflow-hidden border-none shadow-ios relative">
          <div className="p-8 border-b border-border-ios flex justify-between items-center bg-surface/50">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowPicker(showPicker === 'month' ? null : 'month')}
                className="text-2xl font-display font-black tracking-tight text-foreground/90 lowercase first-letter:uppercase hover:text-accent transition-colors"
              >
                {format(currentDate, 'MMMM', { locale: th })}
              </button>
              <button 
                onClick={() => setShowPicker(showPicker === 'year' ? null : 'year')}
                className="text-2xl font-display font-black tracking-tight text-foreground-muted hover:text-accent transition-colors"
              >
                {currentDate.getFullYear() + 543}
              </button>
            </div>
            
            <div className="flex gap-1.5">
               <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
               <div className="w-2 h-2 rounded-full bg-accent/20" />
            </div>
          </div>

          {/* Quick Pickers */}
          {showPicker === 'month' && (
            <div className="absolute inset-x-0 top-[90px] bottom-0 bg-white z-40 p-8 animate-in slide-in-from-top duration-500">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground-muted mb-8 text-center">เลือกเดือน</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {months.map((m, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleMonthChange(idx)}
                    className={`py-6 rounded-2xl font-black text-[13px] uppercase tracking-widest transition-all ${
                      currentDate.getMonth() === idx 
                      ? 'bg-foreground text-white shadow-lg scale-105' 
                      : 'bg-muted/50 text-foreground-muted hover:bg-white hover:shadow-md'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setShowPicker(null)}
                className="w-full mt-12 py-4 text-[10px] font-black uppercase tracking-widest text-accent hover:underline"
              >
                Close Picker
              </button>
            </div>
          )}

          {showPicker === 'year' && (
            <div className="absolute inset-x-0 top-[90px] bottom-0 bg-white z-40 p-8 animate-in slide-in-from-top duration-500 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setYearRangeStart(yearRangeStart - 12)} className="p-2 text-foreground-muted hover:text-accent transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground-muted">
                  ปี พ.ศ. {yearRangeStart + 543} - {yearRangeStart + 11 + 543}
                </h3>
                <button onClick={() => setYearRangeStart(yearRangeStart + 12)} className="p-2 text-foreground-muted hover:text-accent transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearChange(year)}
                    className={`py-6 rounded-2xl font-black text-[13px] uppercase tracking-widest transition-all ${
                      currentDate.getFullYear() === year 
                      ? 'bg-foreground text-white shadow-lg scale-105' 
                      : 'bg-muted/50 text-foreground-muted hover:bg-white hover:shadow-md'
                    }`}
                  >
                    {year + 543}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setShowPicker(null)}
                className="w-full mt-12 py-4 text-[10px] font-black uppercase tracking-widest text-accent hover:underline"
              >
                Close Picker
              </button>
            </div>
          )}

          <div className="p-4 md:p-8">
            <div className="grid grid-cols-7 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-black text-[10px] text-foreground-muted uppercase tracking-[0.2em] py-4">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-border-ios/30 border border-border-ios/30 rounded-2xl overflow-hidden">
              {daysInMonth.map((date) => {
                const dayEvents = getEventsForDate(date);
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isCurrentDay = isToday(date);
                const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');

                return (
                  <div
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      relative min-h-[100px] md:min-h-[120px] p-3 md:p-4 cursor-pointer transition-all duration-500
                      ${!isCurrentMonth ? 'bg-muted/30 opacity-40' : 'bg-white'}
                      ${isSelected ? 'bg-accent/3 opacity-100!' : 'hover:bg-accent/2'}
                    `}
                  >
                    {isCurrentDay && (
                      <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                    
                    <div className={`
                      text-sm font-black mb-3 transition-colors duration-300
                      ${isCurrentDay ? 'text-accent' : isSelected ? 'text-foreground' : 'text-foreground/60'}
                    `}>
                      {format(date, 'd')}
                    </div>

                    <div className="space-y-1.5 overflow-hidden">
                      {dayEvents?.appointments.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/5 border border-accent/10 transition-all hover:bg-accent/10"
                        >
                          <div className="w-1 h-1 rounded-full bg-accent/40" />
                          <div className="text-[9px] font-black text-accent truncate uppercase tracking-tighter">
                            {apt.startTime} {apt.user?.name}
                          </div>
                        </div>
                      ))}
                      {dayEvents && dayEvents.appointments.length > 2 && (
                        <div className="text-[9px] font-black text-foreground-muted/40 uppercase tracking-widest pl-2 pt-1">
                          + {dayEvents.appointments.length - 2} More
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-luxury bg-foreground! border-none! text-white shadow-2xl">
             <div className="flex items-start justify-between mb-8">
                <div>
                   <h3 className="text-3xl font-display font-black tracking-tighter mb-1">
                      {selectedDate ? format(selectedDate, 'd', { locale: th }) : ''}
                   </h3>
                   <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60">
                      {selectedDate ? format(selectedDate, 'MMMM yyyy', { locale: th }) : ''}
                   </p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                   </svg>
                </div>
             </div>
             
             <div className="space-y-4">
                {(() => {
                  const dayEvents = selectedDate ? getEventsForDate(selectedDate) : null;
                  if (!dayEvents || dayEvents.appointments.length === 0) {
                    return (
                      <div className="py-8 text-center border-t border-white/10 mt-6">
                         <div className="text-[11px] font-black uppercase tracking-widest opacity-40">No Bookings Found</div>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-3 pt-6 border-t border-white/10">
                      {dayEvents.appointments.map((apt) => (
                        <div key={apt.id} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-500">
                          <div className="flex items-center justify-between mb-3">
                             <div className="text-[11px] font-black tracking-[0.2em] text-accent uppercase">{apt.startTime} - {apt.endTime}</div>
                             <span className="badge-luxury text-white! bg-accent! border-none!">
                                {apt.status}
                             </span>
                          </div>
                          <div className="font-display font-black text-lg tracking-tight mb-0.5">{apt.user?.name}</div>
                          <div className="text-[11px] font-bold text-white/40 italic mb-4">{apt.service?.name}</div>
                          <button className="w-full py-3 rounded-xl bg-white text-foreground text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all transform group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100">
                             Manage Appointment
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
             </div>
          </div>

          <div className="card-luxury bg-accent/5 border-accent/20 shadow-sm p-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-4">Quick Insights</h4>
            <div className="space-y-4">
               <div className="flex justify-between items-center pb-3 border-b border-accent/10">
                  <span className="text-[13px] font-medium text-foreground/70 italic">Total Capacity</span>
                  <span className="text-sm font-black text-foreground">100%</span>
               </div>
               <div className="flex justify-between items-center pb-3 border-b border-accent/10">
                  <span className="text-[13px] font-medium text-foreground/70 italic">Confirmed</span>
                  <span className="text-sm font-black text-foreground">
                    {events.reduce((acc, ev) => acc + ev.appointments.filter(a => a.status === 'confirmed').length, 0)}
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
