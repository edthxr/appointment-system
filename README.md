| Role | Email | Password | Scope / Permissions |
| :--- | :--- | :--- | :--- |
| **Clinic Owner** | `owner@example.com` | `owner123` | จัดการได้ทุกอย่างในคลินิกตัวเอง |
| **Clinic Admin** | `admin@example.com` | `admin123` | จัดการบริการและข้อมูลทั่วไป |
| **Clinic Staff** | `staff@example.com` | `staff123` | ดูข้อมูลและจัดการนัดหมาย |
| **Customer** | `user@example.com` | `user123` | จองนัดหมายและดูประวัติตัวเอง |

---

## โครงสร้างฐานข้อมูล (Database Schema)
ระบบใช้ PostgreSQL + Drizzle ORM โดยมีโครงสร้างแบบ **Shared Database + clinic_id** เพื่อแยกข้อมูลรายคลินิก (Multi-tenancy) อย่างสมบูรณ์ 

> [!NOTE]
> รายละเอียดโครงสร้างตาราง (Data Dictionary) และความสัมพันธ์ของฐานข้อมูลทั้งหมด สามารถอ่านเพิ่มเติมได้ที่:
> [**src/db/SCHEMA_DOCS.md**](file:///c:/appointment-system/appointment-system/src/db/SCHEMA_DOCS.md)

---

> [!IMPORTANT]
> **API Multi-tenancy**: ทุกการเรียก API (GET, POST, PATCH, DELETE) ที่เกี่ยวข้องกับข้อมูลเฉพาะคลินิก เช่น `/api/services` หรือ `/api/bookings` **ต้อง** ส่ง `clinicId` หรือ `clinicSlug` มาใน Query Parameters เสมอ เพื่อให้ระบบสามารถแยกข้อมูล (Data Isolation) ได้ถูกต้อง

---

## การจัดการฐานข้อมูล (Database Management)
... (เหมือนเดิม) ...

## ฟีเจอร์ที่มี (Features Status)
- [x] **Multi-tenant Core**: รองรับหลายคลินิกใน Database เดียว แยก Data Isolation ด้วย `clinic_id`
- [x] **Real Authentication**: ระบบ Login ตรวจสอบรหัสผ่านจริงด้วย Bcrypt
- [x] **Dynamic Routing**: หน้าบ้านคลินิกแยกตาม Slug `/c/[clinicSlug]`
- [x] **Tenant-aware Admin**: Dashboard และการจัดการข้อมูล แยกตามคลินิกที่ดูแล
- [x] **Service Management**: จัดการบริการรายคลินิก
- [x] **Booking Logic**: คำนวณช่วงเวลาว่าง (Available Slots) อัตโนมัติ

## TODO / Next Steps
- [ ] พัฒนาระบบ Dashboard ขั้นสูง (Charts & Analytics)
- [ ] เชื่อมต่อ Line Notify / SMS สำหรับการแจ้งเตือนจริง
- [ ] ระบบลบ/แก้ไขข้อมูลในหน้า Admin (เพิ่มความปลอดภัยระดับ Row-level Security)
- [ ] หน้าเว็บสำหรับ Super Admin เพื่อสร้างคลินิกใหม่


พจนานุกรมข้อมูล (Database Dictionary)
อัปเดตล่าสุด: 18 มีนาคม 2026
เอกสารนี้ระบุรายละเอียดของโครงสร้างฐานข้อมูล PostgreSQL ที่ใช้ในระบบจองนัดหมาย SaaS แบบหลายคลินิก (QueueFlow)
________________________________________
🌍 1. ตารางส่วนกลาง (Global Tables)
ตารางที่ใช้เก็บข้อมูลภาพรวมของทั้งระบบ
clinics (ข้อมูลคลินิก)
เก็บตัวตนและการตั้งค่าของแต่ละธุรกิจ (Tenant)
ชื่อคอลัมน์	ประเภทข้อมูล	คำอธิบาย
id	UUID (PK)	ไอดีที่ไม่ซ้ำกันของคลินิก
name	TEXT	ชื่อที่ใช้แสดงของคลินิก
slug	TEXT	ชื่อที่ใช้ใน URL (เช่น aura-premium) ต้องไม่ซ้ำกัน
logo_url	TEXT	ลิงก์รูปภาพโลโก้ของคลินิก
theme_config	TEXT	การตั้งค่าธีม UI (สี, ฟอนต์) เก็บเป็น JSON String
is_active	BOOLEAN	สถานะการเปิดใช้งานของคลินิกในระบบ
created_at	TIMESTAMP	เวลาที่สร้างเรคคอร์ด
updated_at	TIMESTAMP	เวลาที่อัปเดตข้อมูลล่าสุด
users (ข้อมูลผู้ใช้)
ศูนย์รวมบัญชีผู้ใช้ทุกคน (Admin, พนักงาน และ ลูกค้า)
ชื่อคอลัมน์	ประเภทข้อมูล	คำอธิบาย
id	UUID (PK)	ไอดีที่ไม่ซ้ำกันของผู้ใช้
name	TEXT	ชื่อ-นามสกุล ของผู้ใช้
email	TEXT	อีเมลสำหรับใช้เข้าสู่ระบบ (ต้องไม่ซ้ำกัน)
phone	TEXT	เบอร์โทรศัพท์ติดต่อ
password_hash	TEXT	รหัสผ่านที่เข้ารหัสด้วย Bcrypt
role	ENUM	super_admin, clinic_owner, clinic_admin, clinic_staff, customer
created_at	TIMESTAMP	เวลาที่สร้างเรคคอร์ด
updated_at	TIMESTAMP	เวลาที่อัปเดตข้อมูลล่าสุด
________________________________________
🔗 2. ตารางเชื่อมโยงและสิทธิ์ (Junction & RBAC)
จัดการความสัมพันธ์และขอบเขตสิทธิ์ระหว่างผู้ใช้กับคลินิก
clinic_users (ผู้ใช้รายคลินิก)
บอกว่าผู้ใช้คนใดสังกัดคลินิกไหนและมีบทบาทอะไรในคลินิกนั้น
ชื่อคอลัมน์	ประเภทข้อมูล	คำอธิบาย
id	UUID (PK)	ไอดีเรคคอร์ด
clinic_id	UUID (FK)	อ้างอิงไอดีคลินิก (clinics.id)
user_id	UUID (FK)	อ้างอิงไอดีผู้ใช้ (users.id)
role	ENUM	บทบาทในคลินิก: clinic_admin, staff, หรือ customer
created_at	TIMESTAMP	เวลาที่สร้างเรคคอร์ด
updated_at	TIMESTAMP	เวลาที่อัปเดตข้อมูลล่าสุด
________________________________________
🏥 3. ตารางข้อมูลเฉพาะคลินิก (Tenant-Specific Tables)
ข้อมูลที่แยกขาดจากกันตามคลินิก ทุกตารางในส่วนนี้ ต้องมี clinic_id
services (บริการ)
รายการบริการทางการแพทย์หรือความงามของแต่ละคลินิก
ชื่อคอลัมน์	ประเภทข้อมูล	คำอธิบาย
id	UUID (PK)	ไอดีบริการ
clinic_id	UUID (FK)	คลินิกเจ้าของบริการ (ใช้แยกข้อมูล)
name	TEXT	ชื่อบริการ (เช่น "ฉีด Botox")
description	TEXT	รายละเอียดหรือสรรพคุณของบริการ
duration_min	INTEGER	เวลาที่ใช้ในการให้บริการ (หน่วยเป็นนาที)
price	DECIMAL	ราคาค่าบริการ
is_active	BOOLEAN	สถานะการเปิดให้บริการ (แสดง/ซ่อน)
appointments (รายการนัดหมาย)
ข้อมูลการจองคิวของลูกค้า
ชื่อคอลัมน์	ประเภทข้อมูล	คำอธิบาย
id	UUID (PK)	ไอดีการจอง
clinic_id	UUID (FK)	คลินิกที่นัดหมายไว้
user_id	UUID (FK)	ลูกค้าผู้ทำการจอง
service_id	UUID (FK)	บริการที่เลือกจอง
appointment_date	TIMESTAMP	วันที่นัดหมาย
start_time	TEXT	เวลาเริ่มนัดหมาย (รูปแบบ HH:mm)
end_time	TEXT	เวลาสิ้นสุดนัดหมาย (รูปแบบ HH:mm)
status	ENUM	สถานะ: pending, confirmed, cancelled, completed
note	TEXT	หมายเหตุเพิ่มเติมหรือคำขอพิเศษ
business_hours (เวลาทำการ)
กำหนดช่วงเวลาที่คลินิกเปิดรับจองในแต่ละวัน
ชื่อคอลัมน์	ประเภทข้อมูล	คำอธิบาย
id	UUID (PK)	ไอดีเรคคอร์ด
clinic_id	UUID (FK)	คลินิกเจ้าของข้อมูล
day_of_week	INTEGER	วันในสัปดาห์ 0 (อา.) ถึง 6 (ส.)
start_time	TEXT	เวลาเปิดทำการ (HH:mm)
end_time	TEXT	เวลาปิดทำการ (HH:mm)
is_open	BOOLEAN	สถานะการเปิดรับจองในวันนั้นๆ
blocked_slots (ช่วงเวลาปิดรับจอง)
ช่วงเวลาที่ปิดรับจองชั่วคราว (เช่น วันหยุดนักขัตฤกษ์ หรือ ช่วงพักเที่ยง)
ชื่อคอลัมน์	ประเภทข้อมูล	คำอธิบาย
id	UUID (PK)	ไอดีเรคคอร์ด
clinic_id	UUID (FK)	คลินิกเจ้าของข้อมูล
blocked_date	TIMESTAMP	วันที่ปิดรับจอง
start_time	TEXT	เวลาที่เริ่มปิด (เป็นค่าว่างหากปิดทั้งวัน)
end_time	TEXT	เวลาที่สิ้นสุดการปิด
reason	TEXT	เหตุผลที่ปิดรับจอง
notifications (ประวัติแจ้งเตือน)
บันทึกการส่งข้อความแจ้งเตือนหาลูกค้า
ชื่อคอลัมน์	ประเภทข้อมูล	คำอธิบาย
id	UUID (PK)	ไอดีการแจ้งเตือน
clinic_id	UUID (FK)	คลินิกผู้ส่ง
user_id	UUID (FK)	ผู้รับข้อความ
appointment_id	UUID (FK)	การนัดหมายที่เกี่ยวข้อง (ถ้ามี)
channel	ENUM	ช่องทาง: email หรือ line
type	ENUM	ประเภท: booking_created, booking_confirmed ฯลฯ
status	ENUM	สถานะการส่ง: pending, sent, failed
sent_at	TIMESTAMP	เวลาที่ส่งข้อความสำเร็จ
•	
•	
•	
•	
•	

