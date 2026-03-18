import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(2, 'ชื่อบริการต้องมีอย่างน้อย 2 ตัวอักษร'),
  description: z.string().optional(),
  durationMin: z.number().min(5, 'ระยะเวลาอย่างน้อย 5 นาที'),
  price: z.number().min(0, 'ราคาต้องไม่ต่ำกว่า 0'),
  isActive: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
