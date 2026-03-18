import { format, addMinutes, startOfDay, endOfDay, isAfter, isBefore, parse } from 'date-fns';

export const formatDate = (date: Date, pattern = 'yyyy-MM-dd') => format(date, pattern);
export const formatTime = (date: Date) => format(date, 'HH:mm');

export const parseTime = (timeStr: string, referenceDate = new Date()) => {
  return parse(timeStr, 'HH:mm', referenceDate);
};

export const getMinutesFromTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const timeFromMinutes = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};
