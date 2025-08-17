import { sql, relations } from "drizzle-orm";
import { 
  pgTable, 
  varchar, 
  text, 
  bigint, 
  boolean, 
  timestamp, 
  decimal, 
  integer,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum('role', ['student', 'instructor', 'admin']);
export const levelEnum = pgEnum('level', ['beginner', 'intermediate', 'advanced']);
export const languageEnum = pgEnum('language', ['English', 'Français', 'Arabic']);
export const lessonTypeEnum = pgEnum('lesson_type', ['video', 'project']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);
export const paymentProviderEnum = pgEnum('payment_provider', ['stripe', 'paypal']);
export const pricingTierEnum = pgEnum('pricing_tier', ['basic', 'pro', 'premium']);
export const statusEnum = pgEnum('status', ['enrolled', 'completed', 'dropped']);
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed']);

// Users Table
export const users = pgTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  publicId: varchar("public_id", { length: 26 }).notNull().unique(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 32 }),
  age: integer("age"),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  avatarUrl: varchar("avatar_url", { length: 1000 }),
  role: roleEnum("role").notNull().default('student'),
  isVerified: boolean("is_verified").notNull().default(false),
  emailVerificationToken: varchar("email_verification_token", { length: 255 }),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpires: timestamp("password_reset_expires"),
  tokenVersion: integer("token_version").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at")
});

// User Profiles Table
export const userProfiles = pgTable("user_profiles", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  bio: text("bio"),
  linkedinUrl: varchar("linkedin_url", { length: 1000 }),
  githubUrl: varchar("github_url", { length: 1000 }),
  experienceLevel: levelEnum("experience_level")
});

// Categories Table
export const categories = pgTable("categories", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  color: varchar("color", { length: 7 }),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Instructors Table
export const instructors = pgTable("instructors", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  title: varchar("title", { length: 120 }),
  experienceYears: integer("experience_years"),
  totalStudents: integer("total_students").notNull().default(0),
  totalCourses: integer("total_courses").notNull().default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).notNull().default('5.00'),
  bio: text("bio"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Courses Table
export const courses = pgTable("courses", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  publicId: varchar("public_id", { length: 26 }).notNull().unique(),
  title: varchar("title", { length: 220 }).notNull(),
  slug: varchar("slug", { length: 260 }).notNull().unique(),
  description: text("description").notNull(),
  categoryId: bigint("category_id", { mode: "number" }).notNull().references(() => categories.id),
  instructorId: bigint("instructor_id", { mode: "number" }).notNull().references(() => instructors.id),
  imageUrl: varchar("image_url", { length: 1000 }),
  trailerVideoUrl: varchar("trailer_video_url", { length: 1000 }),
  level: levelEnum("level").notNull(),
  durationMinutes: integer("duration_minutes"),
  language: languageEnum("language").notNull().default('English'),
  rating: decimal("rating", { precision: 3, scale: 2 }).notNull().default('0.00'),
  studentCount: integer("student_count").notNull().default(0),
  isCertified: boolean("is_certified").notNull().default(true),
  lastUpdated: timestamp("last_updated"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Course Requirements Table
export const courseRequirements = pgTable("course_requirements", {
  courseId: bigint("course_id", { mode: "number" }).notNull().references(() => courses.id, { onDelete: "cascade" }),
  requirement: varchar("requirement", { length: 255 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0)
});

// Course Objectives Table
export const courseObjectives = pgTable("course_objectives", {
  courseId: bigint("course_id", { mode: "number" }).notNull().references(() => courses.id, { onDelete: "cascade" }),
  objective: varchar("objective", { length: 255 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0)
});

// Tags Table
export const tags = pgTable("tags", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  label: varchar("label", { length: 120 }).notNull().unique()
});

// Course Tags Table
export const courseTags = pgTable("course_tags", {
  courseId: bigint("course_id", { mode: "number" }).notNull().references(() => courses.id, { onDelete: "cascade" }),
  tagId: bigint("tag_id", { mode: "number" }).notNull().references(() => tags.id, { onDelete: "cascade" })
});

// Course Pricing Table
export const coursePricing = pgTable("course_pricing", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  courseId: bigint("course_id", { mode: "number" }).notNull().references(() => courses.id, { onDelete: "cascade" }),
  tier: pricingTierEnum("tier").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  features: text("features"),
  isActive: boolean("is_active").notNull().default(true)
});

// Chapters Table
export const chapters = pgTable("chapters", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  courseId: bigint("course_id", { mode: "number" }).notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull(),
  estimatedDurationMinutes: integer("estimated_duration_minutes"),
  isLocked: boolean("is_locked").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Lessons Table
export const lessons = pgTable("lessons", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  chapterId: bigint("chapter_id", { mode: "number" }).notNull().references(() => chapters.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description"),
  type: lessonTypeEnum("type").notNull(),
  videoUrl: varchar("video_url", { length: 1000 }),
  presentationUrl: varchar("presentation_url", { length: 1000 }),
  overview: text("overview").notNull(),
  sortOrder: integer("sort_order").notNull(),
  isPreview: boolean("is_preview").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// User Course Progress Table
export const userCourseProgress = pgTable("user_course_progress", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: bigint("course_id", { mode: "number" }).notNull().references(() => courses.id, { onDelete: "cascade" }),
  enrollmentDate: timestamp("enrollment_date").notNull().defaultNow(),
  completionDate: timestamp("completion_date"),
  progressPercentage: decimal("progress_percentage", { precision: 5, scale: 2 }).notNull().default('0.00'),
  lastAccessed: timestamp("last_accessed").notNull().defaultNow(),
  pricingTier: pricingTierEnum("pricing_tier").notNull(),
  status: statusEnum("status").notNull().default('enrolled')
});

// Orders Table
export const orders = pgTable("orders", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  publicId: varchar("public_id", { length: 26 }).notNull().unique(),
  userId: bigint("user_id", { mode: "number" }).notNull().references(() => users.id, { onDelete: "cascade" }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default('pending'),
  paymentProvider: paymentProviderEnum("payment_provider").notNull(),
  paymentTransactionId: varchar("payment_transaction_id", { length: 255 }),
  idempotencyKey: varchar("idempotency_key", { length: 64 }).unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Order Items Table
export const orderItems = pgTable("order_items", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  orderId: bigint("order_id", { mode: "number" }).notNull().references(() => orders.id, { onDelete: "cascade" }),
  courseId: bigint("course_id", { mode: "number" }).notNull().references(() => courses.id),
  pricingTier: pricingTierEnum("pricing_tier").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull()
});

// Coupons Table
export const coupons = pgTable("coupons", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  discountType: discountTypeEnum("discount_type").notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  usageLimit: integer("usage_limit"),
  perUserLimit: integer("per_user_limit").default(1),
  usedCount: integer("used_count").notNull().default(0),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Define Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId]
  }),
  instructor: one(instructors, {
    fields: [users.id],
    references: [instructors.userId]
  }),
  courseProgress: many(userCourseProgress),
  orders: many(orders)
}));

export const instructorsRelations = relations(instructors, ({ one, many }) => ({
  user: one(users, {
    fields: [instructors.userId],
    references: [users.id]
  }),
  courses: many(courses)
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  category: one(categories, {
    fields: [courses.categoryId],
    references: [categories.id]
  }),
  instructor: one(instructors, {
    fields: [courses.instructorId],
    references: [instructors.id]
  }),
  chapters: many(chapters),
  requirements: many(courseRequirements),
  objectives: many(courseObjectives),
  tags: many(courseTags),
  pricing: many(coursePricing),
  progress: many(userCourseProgress),
  orderItems: many(orderItems)
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  course: one(courses, {
    fields: [chapters.courseId],
    references: [courses.id]
  }),
  lessons: many(lessons)
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  chapter: one(chapters, {
    fields: [lessons.chapterId],
    references: [chapters.id]
  })
}));

export const coursePricingRelations = relations(coursePricing, ({ one }) => ({
  course: one(courses, {
    fields: [coursePricing.courseId],
    references: [courses.id]
  })
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  publicId: true,
  tokenVersion: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  publicId: true,
  rating: true,
  studentCount: true,
  createdAt: true,
  updatedAt: true
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true
});

export const insertInstructorSchema = createInsertSchema(instructors).omit({
  id: true,
  totalStudents: true,
  totalCourses: true,
  rating: true,
  createdAt: true
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  publicId: true,
  createdAt: true,
  updatedAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Instructor = typeof instructors.$inferSelect;
export type InsertInstructor = z.infer<typeof insertInstructorSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Chapter = typeof chapters.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type UserCourseProgress = typeof userCourseProgress.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

// Password reset schemas
export const requestPasswordResetSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type RequestPasswordReset = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
