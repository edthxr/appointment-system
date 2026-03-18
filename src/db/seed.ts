import { pool, db } from './client';
import { users, clinics, clinicUsers, services, businessHours, blockedSlots, appointments, notifications } from './schema';
import { ROLES } from '@/lib/constants';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
  if (!db) {
    console.log('Skipping seed: Database connection not configured.');
    return;
  }

  console.log('Seed started...');

  // Clear existing data to avoid unique constraint violations
  // Delete in order of dependencies
  await db.delete(notifications);
  await db.delete(appointments);
  await db.delete(clinicUsers);
  await db.delete(businessHours);
  await db.delete(services);
  await db.delete(users);
  await db.delete(clinics);

  const adminHash = bcrypt.hashSync('admin123', 10);
  const ownerHash = bcrypt.hashSync('owner123', 10);
  const staffHash = bcrypt.hashSync('staff123', 10);
  const userHash = bcrypt.hashSync('user123', 10);

  // 1. Seed Clinic
  const [defaultClinic] = await db.insert(clinics).values({
    name: 'Aura Premium Clinic',
    slug: 'aura-premium',
    isActive: true,
  }).returning();

  console.log(`Created clinic: ${defaultClinic.name} (${defaultClinic.id})`);

  // 2. Seed Users
  const [adminUser] = await db.insert(users).values({
    name: 'Clinic Admin',
    email: 'admin@example.com',
    passwordHash: adminHash,
    role: ROLES.CLINIC_ADMIN,
  }).returning();

  const [ownerUser] = await db.insert(users).values({
    name: 'Clinic Owner',
    email: 'owner@example.com',
    passwordHash: ownerHash,
    role: ROLES.CLINIC_OWNER,
  }).returning();

  const [staffUser] = await db.insert(users).values({
    name: 'Clinic Staff',
    email: 'staff@example.com',
    passwordHash: staffHash,
    role: ROLES.CLINIC_STAFF,
  }).returning();

  const [customerUser] = await db.insert(users).values({
    name: 'John Doe',
    email: 'user@example.com',
    passwordHash: userHash,
    role: ROLES.USER,
  }).returning();

  // 3. Link Users to Clinic
  await db.insert(clinicUsers).values([
    {
      clinicId: defaultClinic.id,
      userId: ownerUser.id,
      role: ROLES.CLINIC_OWNER,
    },
    {
      clinicId: defaultClinic.id,
      userId: adminUser.id,
      role: ROLES.CLINIC_ADMIN,
    },
    {
      clinicId: defaultClinic.id,
      userId: staffUser.id,
      role: ROLES.CLINIC_STAFF,
    },
    {
      clinicId: defaultClinic.id,
      userId: customerUser.id,
      role: ROLES.CUSTOMER,
    },
  ]);

  // 4. Seed Services
  await db.insert(services).values([
    {
      clinicId: defaultClinic.id,
      name: 'ฉีดวิตามินผิว (Skin Vitamin)',
      description: 'เติมวิตามินเข้มข้นเพื่อผิวกระจ่างใสและสุขภาพดี',
      durationMin: 30,
      price: '1500.00',
    },
    {
      clinicId: defaultClinic.id,
      name: 'เลเซอร์หน้าใส (Aura Laser)',
      description: 'ลดรอยดำ รอยแดง และปรับสีผิวให้สม่ำเสมอด้วยเลเซอร์มาตรฐานสูง',
      durationMin: 45,
      price: '3500.00',
    },
  ]);

  // 5. Seed Business Hours
  const bh = [];
  for (let i = 1; i <= 5; i++) {
    bh.push({ 
      clinicId: defaultClinic.id, 
      dayOfWeek: i, 
      startTime: '09:00', 
      endTime: '18:00', 
      isOpen: true 
    });
  }
  bh.push({ 
    clinicId: defaultClinic.id, 
    dayOfWeek: 6, 
    startTime: '10:00', 
    endTime: '16:00', 
    isOpen: true 
  });
  bh.push({ 
    clinicId: defaultClinic.id, 
    dayOfWeek: 0, 
    startTime: '00:00', 
    endTime: '00:00', 
    isOpen: false 
  });
  await db.insert(businessHours).values(bh);

  // 6. Seed Blocked Slots
  await db.insert(blockedSlots).values([
    {
      clinicId: defaultClinic.id,
      blockedDate: new Date(),
      startTime: '12:00',
      endTime: '13:00',
      reason: 'พักเที่ยง',
    },
    {
      clinicId: defaultClinic.id,
      blockedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      startTime: null,
      endTime: null,
      reason: 'วันหยุดพิเศษ',
    }
  ]);

  // 7. Seed Sample Appointments
  await db.insert(appointments).values([
    {
      clinicId: defaultClinic.id,
      userId: customerUser.id,
      serviceId: (await db.select().from(services).where(eq(services.clinicId, defaultClinic.id)).limit(1))[0].id,
      appointmentDate: new Date(),
      startTime: '10:00',
      endTime: '10:30',
      status: 'confirmed',
    }
  ]);

  console.log('Seed completed successfully!');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
