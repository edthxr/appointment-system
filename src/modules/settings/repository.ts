import { BusinessHours, BlockedSlot } from '../bookings/types';

export interface ISettingRepository {
  getBusinessHours(): Promise<BusinessHours[]>;
  getBlockedSlots(date: Date): Promise<BlockedSlot[]>;
}

const MOCK_BUSINESS_HOURS: BusinessHours[] = [
  { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isOpen: true },
  { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isOpen: true },
  { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isOpen: true },
  { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isOpen: true },
  { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isOpen: true },
  { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isOpen: true },
  { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isOpen: false },
];

export class MockSettingRepository implements ISettingRepository {
  async getBusinessHours(): Promise<BusinessHours[]> {
    return MOCK_BUSINESS_HOURS;
  }
  async getBlockedSlots(date: Date): Promise<BlockedSlot[]> {
    return []; // Placeholder for now
  }
}
