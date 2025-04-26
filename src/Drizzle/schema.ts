import { pgTable, serial, varchar, text, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "doctor", "staff"]);
export const programStatusEnum = pgEnum("program_status", ["active", "inactive", "completed"]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", ["active", "completed", "dropped"]);

// Users table (for system users like doctors)
// schema.ts
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("doctor"),
  // Add these new fields
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  dateOfBirth: timestamp("date_of_birth"),
  gender: varchar("gender", { length: 50 }),
  address: text("address"),
  // Original fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});




// Auth table for authentication data
export const auth = pgTable("auth", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  salt: varchar("salt", { length: 255 }).notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  first_name: varchar("first_name", { length: 255 }).notNull(),
  last_name: varchar("last_name", { length: 255 }).notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  gender: varchar("gender", { length: 50 }),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

// Health programs table
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: programStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

// Client program enrollments
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  programId: integer("program_id").references(() => programs.id),
  status: enrollmentStatusEnum("status").default("active"),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  auth: one(auth, {
    fields: [users.id],
    references: [auth.userId],
  }),
  clients: many(clients),
  programs: many(programs),
  enrollments: many(enrollments),
}));

export const authRelations = relations(auth, ({ one }) => ({
  user: one(users, {
    fields: [auth.userId],
    references: [users.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [clients.createdBy],
    references: [users.id],
  }),
  enrollments: many(enrollments),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [programs.createdBy],
    references: [users.id],
  }),
  enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  client: one(clients, {
    fields: [enrollments.clientId],
    references: [clients.id],
  }),
  program: one(programs, {
    fields: [enrollments.programId],
    references: [programs.id],
  }),
  createdBy: one(users, {
    fields: [enrollments.createdBy],
    references: [users.id],
  }),
}));