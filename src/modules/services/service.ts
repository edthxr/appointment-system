import { IServiceRepository } from './repository';
import { CreateServiceInput, UpdateServiceInput, Service } from './types';
import { PaginatedResult } from '@/lib/types';

export class ServiceService {
  constructor(private serviceRepo: IServiceRepository) {}

  async getAllServices(clinicId: string, page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<PaginatedResult<Service>> {
    return this.serviceRepo.findAll(clinicId, page, limit, search, sortBy, sortOrder);
  }

  async getServiceById(id: string, clinicId: string): Promise<Service | null> {
    return this.serviceRepo.findById(id, clinicId);
  }

  async createService(data: CreateServiceInput): Promise<Service> {
    return this.serviceRepo.create(data);
  }

  async updateService(id: string, clinicId: string, data: UpdateServiceInput): Promise<Service> {
    const existing = await this.serviceRepo.findById(id, clinicId);
    if (!existing) throw new Error('ไม่พบข้อมูลบริการ');
    return this.serviceRepo.update(id, clinicId, data);
  }

  async deleteService(id: string, clinicId: string): Promise<void> {
    const existing = await this.serviceRepo.findById(id, clinicId);
    if (!existing) throw new Error('ไม่พบข้อมูลบริการ');
    
    return this.serviceRepo.delete(id, clinicId);
  }
}
