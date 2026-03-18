import { PaginatedResult } from '@/lib/types';
import { Appointment, CreateBookingInput, BusinessHours, BlockedSlot } from './types';
import { addMinutes, format } from 'date-fns';
import { timeFromMinutes, getMinutesFromTime } from '@/lib/date';
import { APPOINTMENT_STATUS } from '@/lib/constants';

export interface IBookingRepository {
  findAll(clinicId: string, page?: number, limit?: number, search?: string): Promise<PaginatedResult<Appointment>>;
  findByUserId(userId: string, clinicId: string, page?: number, limit?: number, search?: string): Promise<PaginatedResult<Appointment>>;
  findById(id: string, clinicId: string): Promise<Appointment | null>;
  create(data: CreateBookingInput, endTime: string): Promise<Appointment>;
  updateStatus(id: string, clinicId: string, status: Appointment['status']): Promise<Appointment>;
  getAppointmentsByDate(date: Date, clinicId: string): Promise<Appointment[]>;
  getBusinessHours(clinicId: string): Promise<BusinessHours[]>;
  getBlockedSlots(date: Date, clinicId: string): Promise<BlockedSlot[]>;
}

// Mock Data
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    clinicId: 'default-clinic-id',
    userId: 'u1',
    serviceId: 's1',
    appointmentDate: new Date(),
    startTime: '10:00',
    endTime: '10:30',
    status: APPOINTMENT_STATUS.CONFIRMED,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { name: 'สมชาย ใจดี', email: 'user1@example.com' },
    service: { name: 'ตัดผมชาย', durationMin: 30 },
  }
];

const MOCK_BUSINESS_HOURS: BusinessHours[] = [
  { id: 'bh1', clinicId: 'default-clinic-id', dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isOpen: true },
  { id: 'bh2', clinicId: 'default-clinic-id', dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isOpen: true },
  { id: 'bh3', clinicId: 'default-clinic-id', dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isOpen: true },
  { id: 'bh4', clinicId: 'default-clinic-id', dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isOpen: true },
  { id: 'bh5', clinicId: 'default-clinic-id', dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isOpen: true },
  { id: 'bh6', clinicId: 'default-clinic-id', dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isOpen: true },
  { id: 'bh7', clinicId: 'default-clinic-id', dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isOpen: false },
];

const MOCK_BLOCKED_SLOTS: BlockedSlot[] = [
  {
    id: 'b1',
    clinicId: 'default-clinic-id',
    blockedDate: new Date(),
    startTime: '12:00',
    endTime: '13:00',
    reason: 'พักเที่ยง',
  }
];

export class MockBookingRepository implements IBookingRepository {
  async findAll(clinicId: string, page = 1, limit = 10, search?: string): Promise<PaginatedResult<Appointment>> {
    let all = MOCK_APPOINTMENTS.filter(a => a.clinicId === clinicId);
    
    if (search) {
      const q = search.toLowerCase();
      all = all.filter(a => {
        return (
          a.user?.name.toLowerCase().includes(q) ||
          a.user?.email.toLowerCase().includes(q) ||
          a.service?.name.toLowerCase().includes(q) ||
          a.status.toLowerCase().includes(q)
        );
      });
    }

    const start = (page - 1) * limit;
    const data = all.slice(start, start + limit);
    return {
      data,
      total: all.length,
      page,
      limit,
      totalPages: Math.ceil(all.length / limit),
    };
  }
  async findByUserId(userId: string, clinicId: string, page = 1, limit = 10, search?: string): Promise<PaginatedResult<Appointment>> {
    let all = MOCK_APPOINTMENTS.filter((a) => a.userId === userId && a.clinicId === clinicId);
    
    if (search) {
      const q = search.toLowerCase();
      all = all.filter(a => {
        return (
          a.service?.name.toLowerCase().includes(q) ||
          a.status.toLowerCase().includes(q)
        );
      });
    }

    const start = (page - 1) * limit;
    const data = all.slice(start, start + limit);
    return {
      data,
      total: all.length,
      page,
      limit,
      totalPages: Math.ceil(all.length / limit),
    };
  }
  async findById(id: string, clinicId: string): Promise<Appointment | null> {
    return MOCK_APPOINTMENTS.find((a) => a.id === id && a.clinicId === clinicId) || null;
  }
  async create(data: CreateBookingInput, endTime: string): Promise<Appointment> {
    const newBooking: Appointment = {
      ...data,
      id: `a-${Math.random().toString(36).substr(2, 9)}`,
      endTime,
      status: APPOINTMENT_STATUS.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MOCK_APPOINTMENTS.push(newBooking);
    return newBooking;
  }
  async updateStatus(id: string, clinicId: string, status: Appointment['status']): Promise<Appointment> {
    const index = MOCK_APPOINTMENTS.findIndex((a) => a.id === id && a.clinicId === clinicId);
    if (index === -1) throw new Error('Appointment not found');
    MOCK_APPOINTMENTS[index].status = status;
    MOCK_APPOINTMENTS[index].updatedAt = new Date();
    return MOCK_APPOINTMENTS[index];
  }
  async getAppointmentsByDate(date: Date, clinicId: string): Promise<Appointment[]> {
    const dStr = format(date, 'yyyy-MM-dd');
    return MOCK_APPOINTMENTS.filter((a) => format(a.appointmentDate, 'yyyy-MM-dd') === dStr && a.clinicId === clinicId);
  }
  async getBusinessHours(clinicId: string): Promise<BusinessHours[]> {
    return MOCK_BUSINESS_HOURS.filter(bh => bh.clinicId === clinicId);
  }
  async getBlockedSlots(date: Date, clinicId: string): Promise<BlockedSlot[]> {
    const dStr = format(date, 'yyyy-MM-dd');
    return MOCK_BLOCKED_SLOTS.filter((b) => format(b.blockedDate, 'yyyy-MM-dd') === dStr && b.clinicId === clinicId);
  }
}
