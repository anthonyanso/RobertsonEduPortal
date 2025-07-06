import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin users table for custom authentication
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  passwordHash: varchar("password_hash").notNull(),
  role: varchar("role").default("admin"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Students table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: varchar("student_id").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender"),
  nationality: varchar("nationality"),
  address: text("address"),
  gradeLevel: varchar("grade_level"),
  fatherName: varchar("father_name"),
  motherName: varchar("mother_name"),
  guardianPhone: varchar("guardian_phone"),
  guardianEmail: varchar("guardian_email"),
  medicalConditions: text("medical_conditions"),
  specialNeeds: text("special_needs"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Results table
export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  studentId: varchar("student_id").notNull(),
  session: varchar("session").notNull(),
  term: varchar("term").notNull(),
  subjects: jsonb("subjects").notNull(), // Array of {subject, score, grade, remark}
  totalScore: integer("total_score"),
  average: decimal("average", { precision: 5, scale: 2 }),
  gpa: decimal("gpa", { precision: 3, scale: 2 }),
  position: integer("position"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scratch cards table
export const scratchCards = pgTable("scratch_cards", {
  id: serial("id").primaryKey(),
  pin: varchar("pin").unique().notNull(),
  isUsed: boolean("is_used").default(false),
  usedAt: timestamp("used_at"),
  usedBy: varchar("used_by"),
  expiryDate: timestamp("expiry_date").notNull(),
  usageLimit: integer("usage_limit").default(1),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// News/Blog table
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: varchar("category").notNull(),
  author: varchar("author"),
  imageUrl: varchar("image_url"),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admission applications table
export const admissionApplications = pgTable("admission_applications", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender"),
  nationality: varchar("nationality"),
  address: text("address"),
  gradeLevel: varchar("grade_level"),
  preferredStartDate: date("preferred_start_date"),
  previousSchool: varchar("previous_school"),
  previousSchoolAddress: text("previous_school_address"),
  lastGradeCompleted: varchar("last_grade_completed"),
  fatherName: varchar("father_name"),
  motherName: varchar("mother_name"),
  fatherOccupation: varchar("father_occupation"),
  motherOccupation: varchar("mother_occupation"),
  guardianPhone: varchar("guardian_phone"),
  guardianEmail: varchar("guardian_email"),
  medicalConditions: text("medical_conditions"),
  specialNeeds: text("special_needs"),
  heardAboutUs: varchar("heard_about_us"),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default("unread"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// School information table
export const schoolInfo = pgTable("school_info", {
  id: serial("id").primaryKey(),
  key: varchar("key").unique().notNull(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertStudentSchema = createInsertSchema(students).omit({ id: true, createdAt: true, updatedAt: true });
export const insertResultSchema = createInsertSchema(results).omit({ id: true, createdAt: true, updatedAt: true });
export const insertScratchCardSchema = createInsertSchema(scratchCards).omit({ id: true, createdAt: true, updatedAt: true });
export const insertNewsSchema = createInsertSchema(news).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAdmissionApplicationSchema = createInsertSchema(admissionApplications).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSchoolInfoSchema = createInsertSchema(schoolInfo).omit({ id: true, updatedAt: true });
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({ id: true, createdAt: true, updatedAt: true });

// Custom schema for signup that accepts password instead of passwordHash
export const signUpSchema = insertAdminUserSchema.omit({ passwordHash: true }).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  adminCode: z.string().min(1, "Admin code is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Result = typeof results.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;
export type ScratchCard = typeof scratchCards.$inferSelect;
export type InsertScratchCard = z.infer<typeof insertScratchCardSchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type AdmissionApplication = typeof admissionApplications.$inferSelect;
export type InsertAdmissionApplication = z.infer<typeof insertAdmissionApplicationSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type SchoolInfo = typeof schoolInfo.$inferSelect;
export type InsertSchoolInfo = z.infer<typeof insertSchoolInfoSchema>;
