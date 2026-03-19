import { pgTable, text, timestamp, boolean, integer, decimal, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Global Tables ---

export const clinics = pgTable('clinics', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  logoUrl: text('logo_url'),
  themeConfig: text('theme_config'), // JSON string for custom colors etc.
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  phone: text('phone'),
  passwordHash: text('password_hash').notNull(),
   role: text('role', { enum: ['super_admin', 'clinic_owner', 'clinic_admin', 'clinic_staff', 'user'] }).default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Junction table for users and clinics (rbac)
export const clinicUsers = pgTable('clinic_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clinicId: uuid('clinic_id').references(() => clinics.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: text('role', { enum: ['clinic_owner', 'clinic_admin', 'clinic_staff', 'customer'] }).default('customer').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Tenant-specific Tables ---

export const services = pgTable('services', {
  id: uuid('id').defaultRandom().primaryKey(),
  clinicId: uuid('clinic_id').references(() => clinics.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  durationMin: integer('duration_min').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  clinicId: uuid('clinic_id').references(() => clinics.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  serviceId: uuid('service_id').references(() => services.id).notNull(),
  appointmentDate: timestamp('appointment_date').notNull(),
  startTime: text('start_time').notNull(), // HH:mm
  endTime: text('end_time').notNull(),   // HH:mm
  status: text('status', { enum: ['pending', 'confirmed', 'cancelled', 'completed'] }).default('pending').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  clinicId: uuid('clinic_id').references(() => clinics.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  channel: text('channel', { enum: ['email', 'line'] }).notNull(),
  type: text('type', { enum: ['booking_created', 'booking_confirmed', 'booking_cancelled', 'reminder'] }).notNull(),
  message: text('message').notNull(),
  status: text('status', { enum: ['pending', 'sent', 'failed'] }).default('pending').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  readAt: timestamp('read_at'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const businessHours = pgTable('business_hours', {
  id: uuid('id').defaultRandom().primaryKey(),
  clinicId: uuid('clinic_id').references(() => clinics.id).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 (Sun-Sat)
  startTime: text('start_time').notNull(), // HH:mm
  endTime: text('end_time').notNull(),   // HH:mm
  isOpen: boolean('is_open').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const blockedSlots = pgTable('blocked_slots', {
  id: uuid('id').defaultRandom().primaryKey(),
  clinicId: uuid('clinic_id').references(() => clinics.id).notNull(),
  blockedDate: timestamp('blocked_date').notNull(),
  startTime: text('start_time'), // HH:mm (null if whole day)
  endTime: text('end_time'),     // HH:mm
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Relations ---

export const clinicsRelations = relations(clinics, ({ many }) => ({
  clinicUsers: many(clinicUsers),
  services: many(services),
  appointments: many(appointments),
  businessHours: many(businessHours),
  blockedSlots: many(blockedSlots),
}));

export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
  notifications: many(notifications),
  clinicUsers: many(clinicUsers),
}));

export const clinicUsersRelations = relations(clinicUsers, ({ one }) => ({
  clinic: one(clinics, { fields: [clinicUsers.clinicId], references: [clinics.id] }),
  user: one(users, { fields: [clinicUsers.userId], references: [users.id] }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  clinic: one(clinics, { fields: [services.clinicId], references: [clinics.id] }),
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  clinic: one(clinics, { fields: [appointments.clinicId], references: [clinics.id] }),
  user: one(users, { fields: [appointments.userId], references: [users.id] }),
  service: one(services, { fields: [appointments.serviceId], references: [services.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  clinic: one(clinics, { fields: [notifications.clinicId], references: [clinics.id] }),
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  appointment: one(appointments, { fields: [notifications.appointmentId], references: [appointments.id] }),
}));

export const businessHoursRelations = relations(businessHours, ({ one }) => ({
  clinic: one(clinics, { fields: [businessHours.clinicId], references: [clinics.id] }),
}));

export const blockedSlotsRelations = relations(blockedSlots, ({ one }) => ({
  clinic: one(clinics, { fields: [blockedSlots.clinicId], references: [clinics.id] }),
}));

export const platformAuditLogs = pgTable('platform_audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventType: text('event_type').notNull(),
  actorUserId: uuid('actor_user_id'),
  actorRole: text('actor_role'),
  clinicId: uuid('clinic_id'),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  action: text('action').notNull(),
  summary: text('summary').notNull(),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const platformAuditLogsRelations = relations(platformAuditLogs, ({ one }) => ({
  actorUser: one(users, { fields: [platformAuditLogs.actorUserId], references: [users.id] }),
  clinic: one(clinics, { fields: [platformAuditLogs.clinicId], references: [clinics.id] }),
}));
