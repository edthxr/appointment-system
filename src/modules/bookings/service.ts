import { IBookingRepository } from './repository';
import { IServiceRepository } from '../services/repository';
import { getMinutesFromTime, timeFromMinutes } from '@/lib/date';
import { CreateBookingInput, Appointment } from './types';
import { format } from 'date-fns';
import { NotificationService } from '../notifications/service';
import { IUserRepository } from '../auth/repository';

export class BookingService {
  constructor(
    private bookingRepo: IBookingRepository,
    private serviceRepo: IServiceRepository,
    private notificationService: NotificationService,
    private userRepo: IUserRepository
  ) {}

  async getAvailableSlots(date: Date, serviceId: string, clinicId: string) {
    const service = await this.serviceRepo.findById(serviceId, clinicId);
    if (!service) throw new Error('Service not found');

    const dayOfWeek = date.getDay();
    const businessHoursList = await this.bookingRepo.getBusinessHours(clinicId);
    const schedule = businessHoursList.find((bh) => bh.dayOfWeek === dayOfWeek);

    if (!schedule || !schedule.isOpen) return [];

    const startMinutes = getMinutesFromTime(schedule.startTime);
    const endMinutes = getMinutesFromTime(schedule.endTime);
    const appointments = await this.bookingRepo.getAppointmentsByDate(date, clinicId);
    const blockedSlots = await this.bookingRepo.getBlockedSlots(date, clinicId);

    const slots: string[] = [];
    const step = 30; // 30-minute intervals for slot start times

    for (let time = startMinutes; time + service.durationMin <= endMinutes; time += step) {
      const slotStart = time;
      const slotEnd = time + service.durationMin;

      // Check if slot overlaps with appointments
      const isOverlapAppointment = appointments.some((a) => {
        const aStart = getMinutesFromTime(a.startTime);
        const aEnd = getMinutesFromTime(a.endTime);
        return slotStart < aEnd && slotEnd > aStart;
      });

      if (isOverlapAppointment) continue;

      // Check if slot overlaps with blocked slots
      const isOverlapBlocked = blockedSlots.some((b) => {
        if (!b.startTime || !b.endTime) return true; // Whole day blocked
        const bStart = getMinutesFromTime(b.startTime);
        const bEnd = getMinutesFromTime(b.endTime);
        return slotStart < bEnd && slotEnd > bStart;
      });

      if (isOverlapBlocked) continue;

      slots.push(timeFromMinutes(slotStart));
    }

    return slots;
  }

  async createBooking(data: CreateBookingInput) {
    const service = await this.serviceRepo.findById(data.serviceId, data.clinicId);
    if (!service) throw new Error('Service not found');

    const startMin = getMinutesFromTime(data.startTime);
    const endMin = startMin + service.durationMin;
    const endTime = timeFromMinutes(endMin);

    const booking = await this.bookingRepo.create(data, endTime);
    
    // Trigger notification
    const user = await this.userRepo.findById(data.userId);
    if (user) {
      await this.notificationService.send({
        clinicId: data.clinicId,
        userId: data.userId,
        appointmentId: booking.id,
        channel: 'email',
        type: 'booking_created',
        to: user.email,
        message: `คุณได้ทำการจอง ${service.name} ในวันที่ ${format(data.appointmentDate, 'dd/MM/yyyy')} เวลา ${data.startTime}. กรุณารอเจ้าหน้าที่ยืนยัน.`
      });
    }

    return booking;
  }

  async updateStatus(id: string, clinicId: string, status: Appointment['status'], userId: string, isAdmin: boolean) {
    const appointment = await this.bookingRepo.findById(id, clinicId);
    if (!appointment) throw new Error('ไม่พบข้อมูลการนัดหมาย');

    // Admin can update any status
    if (!isAdmin) {
      // User can only cancel their own booking
      if (appointment.userId !== userId) {
        throw new Error('คุณไม่มีสิทธิ์จัดการนัดหมายนี้');
      }

      if (status !== 'cancelled') {
        throw new Error('ไม่อนุญาตให้เปลี่ยนสถานะนี้');
      }

      // Cannot cancel if already cancelled or completed
      if (['cancelled', 'completed'].includes(appointment.status)) {
        throw new Error('ไม่สามารถยกเลิกนัดหมายที่ดำเนินการเสร็จสิ้นหรือถูกยกเลิกไปแล้วได้');
      }
    }

    const result = await this.bookingRepo.updateStatus(id, clinicId, status);
    
    // Trigger notification on status change
    const user = await this.userRepo.findById(appointment.userId);
    const service = await this.serviceRepo.findById(appointment.serviceId, clinicId);
    
    if (user && service) {
      let type: any = 'booking_confirmed';
      let message = `การจอง ${service.name} ของคุณได้รับการยืนยันแล้ว`;
      
      if (status === 'cancelled') {
        type = 'booking_cancelled';
        message = `การจอง ${service.name} ของคุณถูกยกเลิกแล้ว`;
      }

      await this.notificationService.send({
        clinicId,
        userId: user.id,
        appointmentId: id,
        channel: 'email',
        type,
        to: user.email,
        message
      });
    }

    return result;
  }
}
