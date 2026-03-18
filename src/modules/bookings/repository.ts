import { Appointment, CreateBookingInput, BusinessHours, BlockedSlot } from './types';
import { addMinutes, format } from 'date-fns';
import { timeFromMinutes, getMinutesFromTime } from '@/lib/date';
import { APPOINTMENT_STATUS } from '@/lib/constants';

export interface IBookingRepository {
  findAll(): Promise<Appointment[]>;
  findByUserId(userId: string): Promise<Appointment[]>;
  findById(id: string): Promise<Appointment | null>;
  create(data: CreateBookingInput, endTime: string): Promise<Appointment>;
  updateStatus(id: string, status: Appointment['status']): Promise<Appointment>;
  getAppointmentsByDate(date: Date): Promise<Appointment[]>;
  getBusinessHours(): Promise<BusinessHours[]>;
  getBlockedSlots(date: Date): Promise<BlockedSlot[]>;
}

// Mock Data
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
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
  { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isOpen: true },
  { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isOpen: true },
  { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isOpen: true },
  { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isOpen: true },
  { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isOpen: true },
  { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isOpen: true },
  { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isOpen: false },
];

const MOCK_BLOCKED_SLOTS: BlockedSlot[] = [
  {
    id: 'b1',
    blockedDate: new Date(),
    startTime: '12:00',
    endTime: '13:00',
    reason: 'พักเที่ยง',
  }
];

export class MockBookingRepository implements IBookingRepository {
  async findAll(): Promise<Appointment[]> {
    return MOCK_APPOINTMENTS;
  }
  async findByUserId(userId: string): Promise<Appointment[]> {
    return MOCK_APPOINTMENTS.filter((a) => a.userId === userId);
  }
  async findById(id: string): Promise<Appointment | null> {
    return MOCK_APPOINTMENTS.find((a) => a.id === id) || null;
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
  async updateStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    const index = MOCK_APPOINTMENTS.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Appointment not found');
    MOCK_APPOINTMENTS[index].status = status;
    return MOCK_APPOINTMENTS[index];
  }
  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    const dStr = format(date, 'yyyy-MM-dd');
    return MOCK_APPOINTMENTS.filter((a) => format(a.appointmentDate, 'yyyy-MM-dd') === dStr);
  }
  async getBusinessHours(): Promise<BusinessHours[]> {
    return MOCK_BUSINESS_HOURS;
  }
  async getBlockedSlots(date: Date): Promise<BlockedSlot[]> {
    const dStr = format(date, 'yyyy-MM-dd');
    return MOCK_BLOCKED_SLOTS.filter((b) => format(b.blockedDate, 'yyyy-MM-dd') === dStr);
  }
}
