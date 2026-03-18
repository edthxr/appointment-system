import { env } from './env';
import { MockServiceRepository, IServiceRepository } from '../modules/services/repository';
import { DbServiceRepository } from '../modules/services/db-repository';
import { MockBookingRepository, IBookingRepository } from '../modules/bookings/repository';
import { DbBookingRepository } from '../modules/bookings/db-repository';
import { MockUserRepository, IUserRepository } from '../modules/auth/repository';
import { DbUserRepository } from '../modules/auth/db-repository';
import { MockSettingRepository, ISettingRepository } from '../modules/settings/repository';
import { DbSettingRepository } from '../modules/settings/db-repository';
import { MockNotificationRepository, INotificationRepository } from '../modules/notifications/repository';
import { DbNotificationRepository } from '../modules/notifications/db-repository';
import { IClinicRepository } from '../modules/clinics/repository';
import { DbClinicRepository } from '../modules/clinics/db-repository';
import { NotificationService } from '../modules/notifications/service';
import { MockEmailProvider } from '../modules/notifications/email-provider';
import { BookingService } from '../modules/bookings/service';

class RepositoryRegistry {
  private static instance: RepositoryRegistry;
  
  private _serviceRepo: IServiceRepository | null = null;
  private _bookingRepo: IBookingRepository | null = null;
  private _userRepo: IUserRepository | null = null;
  private _settingRepo: ISettingRepository | null = null;
  private _notificationRepo: INotificationRepository | null = null;
  private _clinicRepo: IClinicRepository | null = null;
  private _notificationService: NotificationService | null = null;
  private _bookingService: BookingService | null = null;

  private constructor() {}

  public static getInstance(): RepositoryRegistry {
    if (!RepositoryRegistry.instance) {
      RepositoryRegistry.instance = new RepositoryRegistry();
    }
    return RepositoryRegistry.instance;
  }

  get serviceRepo(): IServiceRepository {
    if (!this._serviceRepo) {
      this._serviceRepo = env.USE_MOCK_DB === 'true' 
        ? new MockServiceRepository() 
        : new DbServiceRepository();
    }
    return this._serviceRepo!;
  }

  get bookingRepo(): IBookingRepository {
    if (!this._bookingRepo) {
      // Always use DB repository for production booking flow
      this._bookingRepo = new DbBookingRepository();
    }
    return this._bookingRepo!;
  }

  get userRepo(): IUserRepository {
    if (!this._userRepo) {
      this._userRepo = env.USE_MOCK_DB === 'true' 
        ? new MockUserRepository() 
        : new DbUserRepository();
    }
    return this._userRepo!;
  }

  get settingRepo(): ISettingRepository {
    if (!this._settingRepo) {
      this._settingRepo = env.USE_MOCK_DB === 'true' 
        ? new MockSettingRepository() 
        : new DbSettingRepository();
    }
    return this._settingRepo!;
  }

  get notificationRepo(): INotificationRepository {
    if (!this._notificationRepo) {
      this._notificationRepo = env.USE_MOCK_DB === 'true' 
        ? new MockNotificationRepository() 
        : new DbNotificationRepository();
    }
    return this._notificationRepo!;
  }

  get clinicRepo(): IClinicRepository {
    if (!this._clinicRepo) {
      this._clinicRepo = new DbClinicRepository();
    }
    return this._clinicRepo!;
  }

  get notificationService(): NotificationService {
    if (!this._notificationService) {
      this._notificationService = new NotificationService(this.notificationRepo);
      // Register default mock providers
      this._notificationService.registerProvider(new MockEmailProvider());
    }
    return this._notificationService!;
  }

  get bookingService(): BookingService {
    if (!this._bookingService) {
      this._bookingService = new BookingService(
        this.bookingRepo,
        this.serviceRepo,
        this.notificationService,
        this.userRepo
      );
    }
    return this._bookingService!;
  }
}

export const registry = RepositoryRegistry.getInstance();
