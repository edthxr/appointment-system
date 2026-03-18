# QueueFlow - SaaS Appointment System MVP

ระบบจองคิวออนไลน์แบบ SaaS MVP พัฒนาด้วย Next.js (App Router), TypeScript และ Drizzle ORM

## โครงสร้างระบบ (Architecture)
ระบบใช้โครงสร้างแบบ Clean Architecture ที่เน้นความง่ายในการสลับระหว่าง Mock Data และ Database จริง:
- `src/app`: Next.js App Router (UI Pages & API Routes)
- `src/modules`: Business Logic แยกตาม Feature (Repository, Service, Type, Validation)
- `src/db`: Database Schema, Client และ Configuration
- `src/lib`: Core Utilities (Auth Guards, Session, Date Utils, API Wrappers)

## วิธีเริ่มต้นใช้งาน (Getting Started)

1. ติดตั้ง dependencies:
   ```bash
   npm install
   ```

2. รันโหมด Development:
   ```bash
   npm run dev
   ```

3. ข้อมูลสำหรับทดสอบ (Mock Login):
   - **Admin:** `admin@example.com` / `password: admin123`
   - **User:** `user@example.com` / `password: user123`

## การจัดการฐานข้อมูล (Database Management)

ระบบใช้ Drizzle ORM ในการจัดการ Schema และ Migration:

### 1. การตั้งค่า Environment
สร้างไฟล์ `.env` จาก `.env.example` และระบุ `DATABASE_URL`:
```bash
DATABASE_URL=postgres://user:password@localhost:5432/dbname
USE_MOCK_DB=false
```

### 2. คำสั่ง Drizzle ORM
- **Generate Migration**: สร้างไฟล์ migration จาก schema
  ```bash
  npm run db:generate
  ```
- **Push Schema**: อัปเดตโครงสร้างฐานข้อมูลโดยตรง (เหมาะสำหรับ Dev)
  ```bash
  npm run db:push
  ```
- **Migrate**: รัน migration ที่เตรียมไว้เข้าสู่ฐานข้อมูล
  ```bash
  npm run db:migrate
  ```

### 3. การเพิ่มข้อมูลเริ่มต้น (Seeding)
รันคำสั่งเพื่อเพิ่มข้อมูลตัวอย่าง (Admin, Services, Business Hours):
```bash
npm run db:seed
```

## การสลับระหว่าง Mock และ Database จริง
คุณสามารถควบคุมการทำงานของระบบผ่าน `USE_MOCK_DB` ใน `.env`:
- `USE_MOCK_DB=true`: ใช้ข้อมูลจำลอง (In-memory) ไม่ต้องใช้ PostgreSQL
- `USE_MOCK_DB=false`: เชื่อมต่อและใช้งาน PostgreSQL จริง (ต้องระบุ `DATABASE_URL`)

## ฟีเจอร์ที่มี (MVP Features)
- [x] **Authentication**: ระบบ Login แยก Role (Admin/User) โดยใช้ Mock Session
- [x] **Service Management**: Admin สามารถดูรายการและจัดการบริการได้
- [x] **Booking Flow**: User สามารถเลือกบริการ เลือกวันที่ และเวลาที่ว่าง (คำนวณจาก Business Hours และ Blocked Slots)
- [x] **Admin Dashboard**: สรุปสถิติเบื้องต้นและรายการนัดหมาย
- [x] **Available Slots Calculation**: Logic คำนวณช่วงเวลาว่างที่ซับซ้อน (รองรับ Service Duration)
- [x] **Notification structure**: เตรียมโครงสร้างสำหรับแจ้งเตือน

## TODO / Next Steps
- [ ] เชื่อมต่อ Database PostgreSQL จริง (ผ่าน `.env`)
- [ ] แทนที่ Mock Repository ด้วย Drizzle Implementation
- [ ] เพิ่มระบบ Notification จริง (Line Notify / Email Service)
- [ ] เพิ่มระบบลบ/แก้ไขข้อมูลในหน้า Admin อย่างสมบูรณ์
