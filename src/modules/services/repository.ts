import { PaginatedResult } from '@/lib/types';
import { Service, CreateServiceInput, UpdateServiceInput } from './types';

export interface IServiceRepository {
  findAll(clinicId: string, page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<PaginatedResult<Service>>;
  findById(id: string, clinicId: string): Promise<Service | null>;
  create(data: CreateServiceInput): Promise<Service>;
  update(id: string, clinicId: string, data: UpdateServiceInput): Promise<Service>;
  delete(id: string, clinicId: string): Promise<void>;
}

// Mock Implementation
const MOCK_SERVICES: Service[] = [
  {
    id: 's1',
    clinicId: 'default-clinic-id',
    name: 'ฉีดวิตามินผิว (Skin Vitamin)',
    description: 'เติมวิตามินเข้มข้นเพื่อผิวกระจ่างใสและสุขภาพดี',
    durationMin: 30,
    price: 1500,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 's2',
    clinicId: 'default-clinic-id',
    name: 'เลเซอร์หน้าใส (Aura Laser)',
    description: 'ลดรอยดำ รอยแดง และปรับสีผิวให้สม่ำเสมอด้วยเลเซอร์มาตรฐานสูง',
    durationMin: 45,
    price: 3500,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class MockServiceRepository implements IServiceRepository {
  async findAll(clinicId: string, page = 1, limit = 10, search?: string, sortBy?: string, sortOrder: 'asc' | 'desc' = 'asc'): Promise<PaginatedResult<Service>> {
    let all = MOCK_SERVICES.filter(s => s.clinicId === clinicId);
    
    if (search) {
      const q = search.toLowerCase();
      all = all.filter(s => 
        s.name.toLowerCase().includes(q) || 
        (s.description?.toLowerCase().includes(q))
      );
    }

    if (sortBy) {
      all.sort((a, b) => {
        const valA = a[sortBy as keyof Service];
        const valB = b[sortBy as keyof Service];
        if (valA! < valB!) return sortOrder === 'asc' ? -1 : 1;
        if (valA! > valB!) return sortOrder === 'asc' ? 1 : -1;
        return 0;
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
  async findById(id: string, clinicId: string): Promise<Service | null> {
    return MOCK_SERVICES.find((s) => s.id === id && s.clinicId === clinicId) || null;
  }
  async create(data: CreateServiceInput): Promise<Service> {
    const newService: Service = {
      ...data,
      id: `s-${Math.random().toString(36).substr(2, 9)}`,
      isActive: data.isActive ?? true,
      description: data.description ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MOCK_SERVICES.push(newService);
    return newService;
  }
  async update(id: string, clinicId: string, data: UpdateServiceInput): Promise<Service> {
    const index = MOCK_SERVICES.findIndex((s) => s.id === id && s.clinicId === clinicId);
    if (index === -1) throw new Error('Service not found');
    MOCK_SERVICES[index] = { ...MOCK_SERVICES[index], ...data, updatedAt: new Date() };
    return MOCK_SERVICES[index];
  }
  async delete(id: string, clinicId: string): Promise<void> {
    const index = MOCK_SERVICES.findIndex((s) => s.id === id && s.clinicId === clinicId);
    if (index !== -1) MOCK_SERVICES.splice(index, 1);
  }
}
