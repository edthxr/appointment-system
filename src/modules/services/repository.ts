import { Service, CreateServiceInput, UpdateServiceInput } from './types';

export interface IServiceRepository {
  findAll(): Promise<Service[]>;
  findById(id: string): Promise<Service | null>;
  create(data: CreateServiceInput): Promise<Service>;
  update(id: string, data: UpdateServiceInput): Promise<Service>;
  delete(id: string): Promise<void>;
}

// Mock Implementation
const MOCK_SERVICES: Service[] = [
  {
    id: 's1',
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
    name: 'เลเซอร์หน้าใส (Aura Laser)',
    description: 'ลดรอยดำ รอยแดง และปรับสีผิวให้สม่ำเสมอด้วยเลเซอร์มาตรฐานสูง',
    durationMin: 45,
    price: 3500,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 's3',
    name: 'กดสิว + ทรีตเมนต์ (Acne Clear)',
    description: 'ดูแลปัญหาสิวอย่างครบวงจร พร้อมทรีตเมนต์ปลอบประโลมผิว',
    durationMin: 60,
    price: 990,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 's4',
    name: 'HIFU ยกกระชับ (HIFU Ultra)',
    description: 'ยกกระชับใบหน้าและลำคอโดยไม่ต้องผ่าตัด เห็นผลทันทีหลังทำ',
    durationMin: 90,
    price: 8900,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 's5',
    name: 'Botox Consultation',
    description: 'ปรึกษาแพทย์ผู้เชี่ยวชาญเพื่อปรับรูปหน้าและลดริ้วรอย',
    durationMin: 30,
    price: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class MockServiceRepository implements IServiceRepository {
  async findAll(): Promise<Service[]> {
    return MOCK_SERVICES;
  }
  async findById(id: string): Promise<Service | null> {
    return MOCK_SERVICES.find((s) => s.id === id) || null;
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
  async update(id: string, data: UpdateServiceInput): Promise<Service> {
    const index = MOCK_SERVICES.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Service not found');
    MOCK_SERVICES[index] = { ...MOCK_SERVICES[index], ...data, updatedAt: new Date() };
    return MOCK_SERVICES[index];
  }
  async delete(id: string): Promise<void> {
    const index = MOCK_SERVICES.findIndex((s) => s.id === id);
    if (index !== -1) MOCK_SERVICES.splice(index, 1);
  }
}
