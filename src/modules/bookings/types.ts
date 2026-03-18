import { AppointmentStatus } from '@/lib/constants';

export interface Appointment {
  id: string;
  clinicId: string;
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
  service?: { name: string; durationMin: number; price?: number };
}

export interface CreateBookingInput {
  clinicId: string;
  userId: string;
  serviceId: string;
  appointmentDate: Date;
  startTime: string;
  note?: string;
}

export interface BusinessHours {
  id: string;
  clinicId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockedSlot {
  id: string;
  clinicId: string;
  blockedDate: Date;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
