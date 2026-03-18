import { client, db } from './client';
import { users, services, businessHours, blockedSlots } from './schema';
import { ROLES } from '@/lib/constants';

async function seed() {
  if (!db) {
    console.log('Skipping seed: Database connection not configured.');
    return;
  }

  console.log('Seed started...');

  // Seed Users
  await db.insert(users).values([
    {
      name: 'System Admin',
      email: 'admin@example.com',
      passwordHash: 'hashed_admin123', // In a real app, use bcrypt
      role: ROLES.ADMIN,
    },
    {
      name: 'John Doe',
      email: 'user1@example.com',
      passwordHash: 'hashed_user123',
      role: ROLES.USER,
    },
  ]);

  // Seed Services
  await db.insert(services).values([
    {
      name: 'ฉีดวิตามินผิว (Skin Vitamin)',
      description: 'เติมวิตามินเข้มข้นเพื่อผิวกระจ่างใสและสุขภาพดี',
      durationMin: 30,
      price: '1500.00',
    },
    {
      name: 'เลเซอร์หน้าใส (Aura Laser)',
      description: 'ลดรอยดำ รอยแดง และปรับสีผิวให้สม่ำเสมอด้วยเลเซอร์มาตรฐานสูง',
      durationMin: 45,
      price: '3500.00',
    },
    {
      name: 'กดสิว + ทรีตเมนต์ (Acne Clear)',
      description: 'ดูแลปัญหาสิวอย่างครบวงจร พร้อมทรีตเมนต์ปลอบประโลมผิว',
      durationMin: 60,
      price: '990.00',
    },
    {
      name: 'HIFU ยกกระชับ (HIFU Ultra)',
      description: 'ยกกระชับใบหน้าและลำคอโดยไม่ต้องผ่าตัด เห็นผลทันทีหลังทำ',
      durationMin: 90,
      price: '8900.00',
    },
  ]);

  // Seed Business Hours
  const bh = [];
  for (let i = 1; i <= 5; i++) {
    bh.push({ dayOfWeek: i, startTime: '09:00', endTime: '18:00', isOpen: true });
  }
  bh.push({ dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isOpen: true });
  bh.push({ dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isOpen: false });
  await db.insert(businessHours).values(bh);

  console.log('Seed completed successfully!');
  await client?.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
