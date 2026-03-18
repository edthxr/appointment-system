import { pgTable, text, timestamp, boolean, integer, decimal, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  phone: text('phone'),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'user'] }).default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const services = pgTable('services', {
  id: uuid('id').defaultRandom().primaryKey(),
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
  userId: uuid('user_id').references(() => users.id).notNull(),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  channel: text('channel', { enum: ['email', 'line'] }).notNull(),
  type: text('type', { enum: ['booking_created', 'booking_confirmed', 'booking_cancelled', 'reminder'] }).notNull(),
  message: text('message').notNull(),
  status: text('status', { enum: ['pending', 'sent', 'failed'] }).default('pending').notNull(),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const businessHours = pgTable('business_hours', {
  id: uuid('id').defaultRandom().primaryKey(),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 (Sun-Sat)
  startTime: text('start_time').notNull(), // HH:mm
  endTime: text('end_time').notNull(),   // HH:mm
  isOpen: boolean('is_open').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const blockedSlots = pgTable('blocked_slots', {
  id: uuid('id').defaultRandom().primaryKey(),
  blockedDate: timestamp('blocked_date').notNull(),
  startTime: text('start_time'), // HH:mm (null if whole day)
  endTime: text('end_time'),     // HH:mm
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
  notifications: many(notifications),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, { fields: [appointments.userId], references: [users.id] }),
  service: one(services, { fields: [appointments.serviceId], references: [services.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  appointment: one(appointments, { fields: [notifications.appointmentId], references: [appointments.id] }),
}));
