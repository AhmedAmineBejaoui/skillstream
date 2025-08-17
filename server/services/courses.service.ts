import { pool } from '../db';

// AUDIT:System Overview -> Course management with multi-tier pricing

interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: string;
  priceTier?: string;
  minPrice?: number;
  maxPrice?: number;
}

function buildPricingMap(rows: any[]) {
  const map: Record<number, any> = {};
  for (const row of rows) {
    if (!map[row.course_id]) map[row.course_id] = {};
    map[row.course_id][row.tier] = {
      price: Number(row.price),
      originalPrice: row.original_price ? Number(row.original_price) : null
    };
  }
  return map;
}

export const coursesService = {
  async listCourses(filters: CourseFilters) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const offset = (page - 1) * limit;

    const [courseRows] = await pool.query<any[]>(
      `SELECT c.id, c.title, c.description, c.image_url, c.level, c.duration,
              c.rating, c.student_count, c.tags,
              cat.name AS category,
              u.first_name, u.last_name, u.avatar_url,
              i.title AS instructor_title
       FROM courses c
       JOIN categories cat ON c.category_id = cat.id
       JOIN instructors i ON c.instructor_id = i.id
       JOIN users u ON i.user_id = u.id`);

    const ids = courseRows.map(c => c.id);
    const [pricingRows] = ids.length
      ? await pool.query<any[]>(`SELECT course_id, tier, price, original_price FROM course_pricing WHERE course_id IN (?)`, [ids])
      : [[], []];
    const pricingMap = buildPricingMap(pricingRows as any[]);

    let courses = courseRows.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      image: c.image_url,
      category: c.category,
      level: c.level,
      duration: c.duration,
      instructor: {
        name: `${c.first_name} ${c.last_name}`,
        avatar: c.avatar_url,
        title: c.instructor_title
      },
      pricing: pricingMap[c.id] || {},
      rating: Number(c.rating) || 0,
      reviewCount: 0,
      studentCount: Number(c.student_count) || 0,
      tags: c.tags ? JSON.parse(c.tags) : []
    }));

    // Search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      courses = courses.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (filters.category) {
      courses = courses.filter(c => c.category === filters.category);
    }

    // Level filter
    if (filters.level) {
      courses = courses.filter(c => c.level === filters.level);
    }

    // Price filters
    if (filters.priceTier || filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      courses = courses.filter(c => {
        const tiers = filters.priceTier ? [filters.priceTier] : Object.keys(c.pricing);
        return tiers.some(tier => {
          const priceObj = (c.pricing as any)[tier];
          if (!priceObj) return false;
          if (filters.minPrice !== undefined && priceObj.price < filters.minPrice) return false;
          if (filters.maxPrice !== undefined && priceObj.price > filters.maxPrice) return false;
          return true;
        });
      });
    }

    const totalCourses = courses.length;
    const paginated = courses.slice(offset, offset + limit);
    const totalPages = Math.ceil(totalCourses / limit);

    const [categoryRows] = await pool.query<any[]>(`SELECT name FROM categories WHERE is_active = 1`);
    const [priceRangeRow] = await pool.query<any[]>(`SELECT MIN(price) AS min, MAX(price) AS max FROM course_pricing`);

    return {
      courses: paginated,
      pagination: {
        currentPage: page,
        totalPages,
        totalCourses,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        categories: categoryRows.map(r => r.name),
        levels: ['beginner', 'intermediate', 'advanced'],
        priceRange: {
          min: Number(priceRangeRow[0]?.min) || 0,
          max: Number(priceRangeRow[0]?.max) || 0
        }
      }
    };
  },

  async getCourseById(id: number) {
    const [rows] = await pool.query<any[]>(
      `SELECT c.*, cat.name AS category, u.first_name, u.last_name, u.avatar_url, i.title AS instructor_title
       FROM courses c
       JOIN categories cat ON c.category_id = cat.id
       JOIN instructors i ON c.instructor_id = i.id
       JOIN users u ON i.user_id = u.id
       WHERE c.id = ?`,
      [id]
    );
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const c = rows[0];

    const [pricingRows] = await pool.query<any[]>(`SELECT tier, price, original_price FROM course_pricing WHERE course_id = ?`, [id]);
    const pricing = buildPricingMap(pricingRows as any[])[id] || {};

    const [chapterRows] = await pool.query<any[]>(
      `SELECT ch.id, ch.title, ch.description, ch.estimated_duration_minutes, ch.is_locked,
              (SELECT COUNT(*) FROM lessons l WHERE l.chapter_id = ch.id) AS lessonCount
       FROM chapters ch WHERE ch.course_id = ? ORDER BY ch.sort_order`,
      [id]
    );
    const chapters = chapterRows.map(ch => ({
      id: ch.id,
      title: ch.title,
      description: ch.description,
      duration: ch.estimated_duration_minutes ? `${ch.estimated_duration_minutes}m` : null,
      lessonCount: ch.lessonCount,
      isLocked: !!ch.is_locked,
      isCompleted: false
    }));

    return {
      course: {
        id: c.id,
        title: c.title,
        description: c.description,
        image: c.image_url,
        category: c.category,
        level: c.level,
        duration: c.duration,
        instructor: {
          name: `${c.first_name} ${c.last_name}`,
          avatar: c.avatar_url,
          title: c.instructor_title,
          experience: null,
          totalStudents: c.student_count,
          totalCourses: null
        },
        pricing,
        rating: Number(c.rating) || 0,
        reviewCount: 0,
        studentCount: Number(c.student_count) || 0,
        tags: c.tags ? JSON.parse(c.tags) : [],
        trailerVideo: c.trailer_video_url,
        totalDuration: c.duration,
        language: c.language,
        lastUpdated: c.last_updated,
        features: [],
        requirements: c.requirements ? JSON.parse(c.requirements) : [],
        learningObjectives: c.learning_objectives ? JSON.parse(c.learning_objectives) : [],
        chapters
      },
      isEnrolled: false,
      userProgress: 0
    };
  }
};
