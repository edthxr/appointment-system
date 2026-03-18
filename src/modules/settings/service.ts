import { ISettingRepository } from './repository';

export class SettingService {
  constructor(private settingRepo: ISettingRepository) {}

  async getBusinessHours() {
    return this.settingRepo.getBusinessHours();
  }

  async getBlockedSlots(date: Date) {
    return this.settingRepo.getBlockedSlots(date);
  }
}
