export interface User {
  id: number;
  publicId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: 'student' | 'instructor' | 'admin';
  profile?: UserProfile;
  instructor?: Instructor;
  createdAt: string;
}

export interface UserProfile {
  id: number;
  userId: number;
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface Instructor {
  id: number;
  userId: number;
  title?: string;
  experienceYears?: number;
  totalStudents: number;
  totalCourses: number;
  rating: number;
  bio?: string;
  user?: User;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Course {
  id: number;
  publicId: string;
  title: string;
  slug: string;
  description: string;
  categoryId: number;
  instructorId: number;
  imageUrl?: string;
  trailerVideoUrl?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes?: number;
  language: 'English' | 'Français' | 'Arabic';
  rating: number;
  studentCount: number;
  isCertified: boolean;
  lastUpdated?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  instructor?: Instructor;
  chapters?: Chapter[];
  pricing?: CoursePricing[];
  requirements?: CourseRequirement[];
  objectives?: CourseObjective[];
}

export interface Chapter {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  sortOrder: number;
  estimatedDurationMinutes?: number;
  isLocked: boolean;
  createdAt: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  chapterId: number;
  title: string;
  description?: string;
  type: 'video' | 'project';
  videoUrl?: string;
  presentationUrl?: string;
  overview: string;
  sortOrder: number;
  isPreview: boolean;
  createdAt: string;
}

export interface CoursePricing {
  id: number;
  courseId: number;
  tier: 'basic' | 'pro' | 'premium';
  price: number;
  originalPrice?: number;
  features?: string;
  isActive: boolean;
}

export interface CourseRequirement {
  courseId: number;
  requirement: string;
  sortOrder: number;
}

export interface CourseObjective {
  courseId: number;
  objective: string;
  sortOrder: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  age?: number;
  password: string;
  confirmPassword: string;
  role?: 'student' | 'instructor';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    traceId?: string;
  };
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
