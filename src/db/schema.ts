import { pgTable, uuid, text, timestamp, date, boolean } from "drizzle-orm/pg-core";

export const participants = pgTable("participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  preferredName: text("preferred_name"),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  suburb: text("suburb").notNull(),
  state: text("state").notNull(),
  postcode: text("postcode").notNull(),
  ndisNumber: text("ndis_number"),
  supportNeeds: text("support_needs").array().notNull().default([]),
  accessibilityNotes: text("accessibility_notes"),
  color: text("color").notNull().default("pine"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const staff = pgTable("staff", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  role: text("role").notNull(),
  region: text("region").notNull(),
  specialities: text("specialities").array().notNull().default([]),
  active: boolean("active").notNull().default(true),
  color: text("color").notNull().default("pine"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const serviceRequests = pgTable("service_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  participantId: uuid("participant_id")
    .notNull()
    .references(() => participants.id, { onDelete: "cascade" }),
  serviceType: text("service_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  suburb: text("suburb").notNull(),
  preferredDate: date("preferred_date", { mode: "string" }),
  preferredTime: text("preferred_time").notNull().default("Flexible"),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  assignedStaffId: uuid("assigned_staff_id").references(() => staff.id, {
    onDelete: "set null",
  }),
  staffNotes: text("staff_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;
export type Staff = typeof staff.$inferSelect;
export type NewStaff = typeof staff.$inferInsert;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type NewServiceRequest = typeof serviceRequests.$inferInsert;
