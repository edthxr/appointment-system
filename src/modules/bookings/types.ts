import { AppointmentStatus } from '@/lib/constants';

export interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  appointmentDate: Date;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  status: AppointmentStatus;
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (optional in core type, can be expanded)
  user?: { name: string; email: string };
  service?: { name: string; durationMin: number };
}

export interface CreateBookingInput {
  userId: string;
  serviceId: string;
  appointmentDate: Date;
  startTime: string;
  note?: string;
}

export interface BusinessHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOpen: boolean;
}

export interface BlockedSlot {
  id: string;
  blockedDate: Date;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
}
