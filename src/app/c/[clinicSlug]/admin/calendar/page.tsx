'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
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

export default function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/calendar?date=${format(currentDate, 'yyyy-MM-dd')}&view=month&clinicSlug=aura-premium`);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ปฏิทิน</h1>
          <p className="text-foreground-muted mt-2">ดูนัดหมายทั้งหมดในรูปแบบปฏิทิน</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="px-4 py-2 bg-muted rounded-lg hover:bg-accent hover:text-white transition-colors"
          >
            เดือนก่อนหน้า
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
          >
            วันนี้
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="px-4 py-2 bg-muted rounded-lg hover:bg-accent hover:text-white transition-colors"
          >
            เดือนถัดไป
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: th })}
          </h2>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
            <div key={day} className="text-center font-semibold text-sm text-foreground-muted py-2">
              {day}
            </div>
          ))}

          {daysInMonth.map((date) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isCurrentDay = isToday(date);

            return (
              <div
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`
                  min-h-[80px] p-2 border border-border rounded-lg cursor-pointer transition-all
                  ${!isCurrentMonth ? 'bg-muted/50 text-foreground-muted' : 'bg-card'}
                  ${isCurrentDay ? 'ring-2 ring-accent' : ''}
                  ${selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ? 'bg-accent/10 border-accent' : ''}
                  hover:bg-accent/5
                `}
              >
                <div className="text-sm font-medium mb-1">
                  {format(date, 'd')}
                </div>
                {dayEvents?.appointments.slice(0, 2).map((apt, idx) => (
                  <div
                    key={apt.id}
                    className="text-xs p-1 mb-1 rounded bg-accent/20 text-accent truncate"
                  >
                    {apt.startTime} {apt.user?.name}
                  </div>
                ))}
                {dayEvents && dayEvents.appointments.length > 2 && (
                  <div className="text-xs text-foreground-muted">
                    +{dayEvents.appointments.length - 2} อื่น
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">
            นัดหมายวันที่ {format(selectedDate, 'd MMMM yyyy', { locale: th })}
          </h3>
          {(() => {
            const dayEvents = getEventsForDate(selectedDate);
            if (!dayEvents || dayEvents.appointments.length === 0) {
              return <p className="text-foreground-muted">ไม่มีนัดหมายในวันนี้</p>;
            }
            return (
              <div className="space-y-3">
                {dayEvents.appointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{apt.startTime} - {apt.endTime}</div>
                      <div className="text-sm text-foreground-muted">
                        {apt.user?.name} - {apt.service?.name}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                        {apt.status}
                      </span>
                      <button className="px-3 py-1 bg-foreground text-white text-xs rounded-lg hover:bg-foreground/80">
                        จัดการ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
