import { eq, desc, and, like, sql } from 'drizzle-orm';
import { db } from '../db';
import { 
  courses, 
  categories, 
  chapters, 
  lessons, 
  instructors,
  users,
  coursePricing,
  courseRequirements,
  courseObjectives,
  type Course, 
  type Category,
  type Chapter,
  type Lesson,
  type InsertCourse
} from '@shared/schema';
import { randomBytes } from 'crypto';

export class CourseService {
  async getAllCourses(filters?: {
    category?: string;
    level?: string;
    language?: string;
    search?: string;
    isPublished?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ courses: Course[]; total: number }> {
    // Use basic select query instead of relational query
    const whereConditions = [];
    
    if (filters?.isPublished !== undefined) {
      whereConditions.push(eq(courses.isPublished, filters.isPublished));
    }
    
    if (filters?.level) {
      whereConditions.push(eq(courses.level, filters.level as any));
    }
    
    if (filters?.search) {
      whereConditions.push(like(courses.title, `%${filters.search}%`));
    }
    
    const courseList = await db
      .select()
      .from(courses)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(courses.createdAt))
      .limit(filters?.limit || 50)
      .offset(filters?.offset || 0);

    const total = courseList.length;
    
    return { 
      courses: courseList,
      total 
    };
  }

  async getCourseById(id: number): Promise<Course | null> {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id));
      
    return course || null;
  }

  async getCourseBySlug(slug: string): Promise<Course | null> {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, slug));
      
    return course || null;
  }

  async getCourseBySlugFull(slug: string): Promise<Course | undefined> {
    return db.query.courses.findFirst({
      where: eq(courses.slug, slug),
      with: {
        category: true,
        instructor: {
          with: {
            user: true
          }
        },
        chapters: {
          with: {
            lessons: true
          }
        },
        pricing: true,
        requirements: true,
        objectives: true
      }
    });
  }

  async createCourse(data: InsertCourse & {
    requirements?: string[];
    objectives?: string[];
    pricingTiers?: Array<{
      tier: 'basic' | 'pro' | 'premium';
      price: number;
      originalPrice?: number;
      features?: string;
    }>;
  }): Promise<Course> {
    const publicId = randomBytes(13).toString('base64url');
    const slug = this.generateSlug(data.title);

    const [newCourse] = await db.insert(courses).values({
      ...data,
      publicId,
      slug
    }).returning();

    // Add requirements
    if (data.requirements?.length) {
      await db.insert(courseRequirements).values(
        data.requirements.map((req, index) => ({
          courseId: newCourse.id,
          requirement: req,
          sortOrder: index
        }))
      );
    }

    // Add objectives
    if (data.objectives?.length) {
      await db.insert(courseObjectives).values(
        data.objectives.map((obj, index) => ({
          courseId: newCourse.id,
          objective: obj,
          sortOrder: index
        }))
      );
    }

    // Add pricing tiers
    if (data.pricingTiers?.length) {
      await db.insert(coursePricing).values(
        data.pricingTiers.map(tier => ({
          courseId: newCourse.id,
          tier: tier.tier,
          price: tier.price.toString(),
          originalPrice: tier.originalPrice?.toString(),
          features: tier.features
        }))
      );
    }

    return newCourse;
  }

  async updateCourse(id: number, data: Partial<Course>): Promise<Course> {
    const [updatedCourse] = await db.update(courses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();

    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  async getAllCategories(): Promise<Category[]> {
    return db.query.categories.findMany({
      orderBy: [categories.sortOrder, categories.name]
    });
  }

  async createCategory(data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  }): Promise<Category> {
    const slug = this.generateSlug(data.name);
    
    const [newCategory] = await db.insert(categories).values({
      ...data,
      slug
    }).returning();

    return newCategory;
  }

  async createChapter(courseId: number, data: {
    title: string;
    description?: string;
    sortOrder: number;
    estimatedDurationMinutes?: number;
  }): Promise<Chapter> {
    const [newChapter] = await db.insert(chapters).values({
      courseId,
      ...data
    }).returning();

    return newChapter;
  }

  async createLesson(chapterId: number, data: {
    title: string;
    description?: string;
    type: 'video' | 'project';
    videoUrl?: string;
    presentationUrl?: string;
    overview: string;
    sortOrder: number;
    isPreview?: boolean;
  }): Promise<Lesson> {
    const [newLesson] = await db.insert(lessons).values({
      chapterId,
      ...data
    }).returning();

    return newLesson;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}

export const courseService = new CourseService();
