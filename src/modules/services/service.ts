import { IServiceRepository } from './repository';
import { CreateServiceInput, UpdateServiceInput, Service } from './types';

export class ServiceService {
  constructor(private serviceRepo: IServiceRepository) {}

  async getAllServices(): Promise<Service[]> {
    return this.serviceRepo.findAll();
  }

  async getServiceById(id: string): Promise<Service | null> {
    return this.serviceRepo.findById(id);
  }

  async createService(data: CreateServiceInput): Promise<Service> {
    return this.serviceRepo.create(data);
  }

  async updateService(id: string, data: UpdateServiceInput): Promise<Service> {
    const existing = await this.serviceRepo.findById(id);
    if (!existing) throw new Error('ไม่พบข้อมูลบริการ');
    return this.serviceRepo.update(id, data);
  }

  async deleteService(id: string): Promise<void> {
    const existing = await this.serviceRepo.findById(id);
    if (!existing) throw new Error('ไม่พบข้อมูลบริการ');
    
    // In a real app, you might want to check for active appointments before deleting
    // Or just mark as inactive
    return this.serviceRepo.delete(id);
  }
}
