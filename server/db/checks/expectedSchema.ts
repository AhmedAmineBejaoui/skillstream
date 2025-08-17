import type { } from 'mysql2';

export interface ColumnSpec {
  type: string;
  nullable: boolean;
  default?: string | null;
  onUpdate?: string | null;
  pk?: boolean;
  unique?: boolean;
  fk?: { table: string; column: string; onDelete?: string };
}

export interface TableSpec {
  columns: Record<string, ColumnSpec>;
  constraints?: {
    unique?: Array<{ columns: string[]; name?: string }>;
    fk?: Array<{ columns: string[]; referencedTable: string; referencedColumns: string[]; onDelete?: string }>;
  };
}

export const expectedSchema: Record<string, TableSpec> = {
  users: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      first_name: { type: 'VARCHAR(50)', nullable: false },
      last_name: { type: 'VARCHAR(50)', nullable: false },
      email: { type: 'VARCHAR(100)', nullable: false, unique: true },
      phone: { type: 'VARCHAR(20)', nullable: true },
      age: { type: 'INT', nullable: true },
      password_hash: { type: 'VARCHAR(255)', nullable: false },
      avatar_url: { type: 'VARCHAR(500)', nullable: true },
      role: { type: "ENUM('student','instructor','admin')", nullable: false, default: "'student'" },
      is_verified: { type: 'BOOLEAN', nullable: false, default: '0' },
      email_verification_token: { type: 'VARCHAR(255)', nullable: true },
      password_reset_token: { type: 'VARCHAR(255)', nullable: true },
      password_reset_expires: { type: 'DATETIME', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
      updated_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }
    }
  },
  user_profiles: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      user_id: { type: 'INT', nullable: false, fk: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
      bio: { type: 'TEXT', nullable: true },
      linkedin_url: { type: 'VARCHAR(500)', nullable: true },
      github_url: { type: 'VARCHAR(500)', nullable: true },
      skills: { type: 'JSON', nullable: true },
      experience_level: { type: "ENUM('beginner','intermediate','advanced')", nullable: true }
    }
  },
  categories: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      name: { type: 'VARCHAR(100)', nullable: false, unique: true },
      description: { type: 'TEXT', nullable: true },
      icon: { type: 'VARCHAR(50)', nullable: true },
      color: { type: 'VARCHAR(7)', nullable: true },
      is_active: { type: 'BOOLEAN', nullable: false, default: '1' },
      sort_order: { type: 'INT', nullable: true, default: '0' },
      created_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' }
    }
  },
  instructors: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      user_id: { type: 'INT', nullable: false, fk: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
      title: { type: 'VARCHAR(100)', nullable: true },
      experience_years: { type: 'INT', nullable: true },
      total_students: { type: 'INT', nullable: false, default: '0' },
      total_courses: { type: 'INT', nullable: false, default: '0' },
      rating: { type: 'DECIMAL(3,2)', nullable: false, default: '5.00' },
      bio: { type: 'TEXT', nullable: true },
      expertise: { type: 'JSON', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' }
    }
  },
  courses: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      title: { type: 'VARCHAR(200)', nullable: false },
      slug: { type: 'VARCHAR(250)', nullable: false, unique: true },
      description: { type: 'TEXT', nullable: false },
      category_id: { type: 'INT', nullable: false, fk: { table: 'categories', column: 'id' } },
      instructor_id: { type: 'INT', nullable: false, fk: { table: 'instructors', column: 'id' } },
      image_url: { type: 'VARCHAR(500)', nullable: true },
      trailer_video_url: { type: 'VARCHAR(500)', nullable: true },
      level: { type: "ENUM('beginner','intermediate','advanced')", nullable: false },
      duration: { type: 'DECIMAL(5,2)', nullable: true },
      language: { type: "ENUM('English','Français','Arabic')", nullable: false, default: "'English'" },
      requirements: { type: 'JSON', nullable: true },
      learning_objectives: { type: 'JSON', nullable: true },
      tags: { type: 'JSON', nullable: true },
      rating: { type: 'DECIMAL(3,2)', nullable: false, default: '0.00' },
      student_count: { type: 'INT', nullable: false, default: '0' },
      is_certified: { type: 'BOOLEAN', nullable: false, default: '1' },
      last_updated: { type: 'DATE', nullable: true },
      is_published: { type: 'BOOLEAN', nullable: false, default: '0' },
      created_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
      updated_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }
    }
  },
  course_pricing: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      course_id: { type: 'INT', nullable: false, fk: { table: 'courses', column: 'id', onDelete: 'CASCADE' } },
      tier: { type: "ENUM('basic','pro','premium')", nullable: false },
      price: { type: 'DECIMAL(10,2)', nullable: false },
      original_price: { type: 'DECIMAL(10,2)', nullable: true },
      features: { type: 'JSON', nullable: true },
      is_active: { type: 'BOOLEAN', nullable: false, default: '1' }
    },
    constraints: {
      unique: [ { columns: ['course_id', 'tier'], name: 'unique_course_tier' } ]
    }
  },
  chapters: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      course_id: { type: 'INT', nullable: false, fk: { table: 'courses', column: 'id', onDelete: 'CASCADE' } },
      title: { type: 'VARCHAR(200)', nullable: false },
      description: { type: 'TEXT', nullable: true },
      sort_order: { type: 'INT', nullable: false },
      estimated_duration_minutes: { type: 'INT', nullable: true },
      is_locked: { type: 'BOOLEAN', nullable: false, default: '1' },
      created_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' }
    }
  },
  lessons: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      chapter_id: { type: 'INT', nullable: false, fk: { table: 'chapters', column: 'id', onDelete: 'CASCADE' } },
      title: { type: 'VARCHAR(200)', nullable: false },
      description: { type: 'TEXT', nullable: true },
      type: { type: "ENUM('video','project')", nullable: false },
      video_url: { type: 'VARCHAR(500)', nullable: true },
      presentation_url: { type: 'VARCHAR(500)', nullable: true },
      overview: { type: 'LONGTEXT', nullable: false },
      sort_order: { type: 'INT', nullable: false },
      is_preview: { type: 'BOOLEAN', nullable: false, default: '0' },
      created_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' }
    }
  },
  exercises: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      lesson_id: { type: 'INT', nullable: false, fk: { table: 'lessons', column: 'id', onDelete: 'CASCADE' } },
      title: { type: 'VARCHAR(200)', nullable: false },
      description: { type: 'TEXT', nullable: false },
      instructions: { type: 'JSON', nullable: true },
      is_complete: { type: 'BOOLEAN', nullable: false, default: '0' }
    }
  },
  quizzes: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      chapter_id: { type: 'INT', nullable: true, fk: { table: 'chapters', column: 'id', onDelete: 'CASCADE' } },
      title: { type: 'VARCHAR(200)', nullable: false },
      questions: { type: 'JSON', nullable: false },
      passing_score: { type: 'INT', nullable: false, default: '80' },
      time_limit_minutes: { type: 'INT', nullable: false, default: '15' },
      attempts_allowed: { type: 'INT', nullable: false, default: '3' },
      created_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' }
    }
  },
  user_course_progress: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      user_id: { type: 'INT', nullable: false, fk: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
      course_id: { type: 'INT', nullable: false, fk: { table: 'courses', column: 'id', onDelete: 'CASCADE' } },
      enrollment_date: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
      completion_date: { type: 'TIMESTAMP', nullable: true },
      progress_percentage: { type: 'DECIMAL(5,2)', nullable: false, default: '0.00' },
      last_accessed: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
      pricing_tier: { type: "ENUM('basic','pro','premium')", nullable: false },
      status: { type: "ENUM('enrolled','completed','dropped')", nullable: false, default: "'enrolled'" }
    },
    constraints: {
      unique: [ { columns: ['user_id', 'course_id'], name: 'unique_user_course' } ]
    }
  },
  user_lesson_progress: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      user_id: { type: 'INT', nullable: false, fk: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
      lesson_id: { type: 'INT', nullable: false, fk: { table: 'lessons', column: 'id', onDelete: 'CASCADE' } },
      is_completed: { type: 'BOOLEAN', nullable: false, default: '0' },
      completion_date: { type: 'TIMESTAMP', nullable: true },
      watch_time_seconds: { type: 'INT', nullable: false, default: '0' },
      created_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
      updated_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }
    },
    constraints: {
      unique: [ { columns: ['user_id', 'lesson_id'], name: 'unique_user_lesson' } ]
    }
  },
  quiz_attempts: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      user_id: { type: 'INT', nullable: false, fk: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
      quiz_id: { type: 'INT', nullable: false, fk: { table: 'quizzes', column: 'id', onDelete: 'CASCADE' } },
      score: { type: 'DECIMAL(5,2)', nullable: true },
      answers: { type: 'JSON', nullable: true },
      started_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
      completed_at: { type: 'TIMESTAMP', nullable: true },
      time_taken_minutes: { type: 'INT', nullable: true },
      is_passed: { type: 'BOOLEAN', nullable: false, default: '0' },
      attempt_number: { type: 'INT', nullable: false, default: '1' }
    }
  },
  exams: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      course_id: { type: 'INT', nullable: false, fk: { table: 'courses', column: 'id', onDelete: 'CASCADE' } },
      title: { type: 'VARCHAR(200)', nullable: false },
      description: { type: 'TEXT', nullable: true },
      instructions: { type: 'JSON', nullable: true },
      requirements: { type: 'JSON', nullable: true },
      duration_hours: { type: 'INT', nullable: false },
      total_marks: { type: 'INT', nullable: false, default: '100' },
      passing_marks: { type: 'INT', nullable: false, default: '70' },
      attempts_limit: { type: 'INT', nullable: false, default: '3' },
      created_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' }
    }
  },
  exam_resources: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      exam_id: { type: 'INT', nullable: false, fk: { table: 'exams', column: 'id', onDelete: 'CASCADE' } },
      file_name: { type: 'VARCHAR(200)', nullable: false },
      file_description: { type: 'TEXT', nullable: false },
      file_type: { type: 'VARCHAR(200)', nullable: false },
      file_url: { type: 'VARCHAR(200)', nullable: false }
    }
  },
  exam_submissions: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      user_id: { type: 'INT', nullable: false, fk: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
      exam_id: { type: 'INT', nullable: false, fk: { table: 'exams', column: 'id', onDelete: 'CASCADE' } },
      submission_notes: { type: 'TEXT', nullable: true },
      started_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
      submitted_at: { type: 'TIMESTAMP', nullable: true },
      graded_at: { type: 'TIMESTAMP', nullable: true },
      score: { type: 'DECIMAL(5,2)', nullable: true },
      feedback: { type: 'TEXT', nullable: true },
      status: { type: "ENUM('in progress','submitted','graded','revision_required')", nullable: false, default: "'in progress'" },
      attempt_number: { type: 'INT', nullable: false, default: '1' }
    }
  },
  exam_submission_files: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      submission_id: { type: 'INT', nullable: false, fk: { table: 'exam_submissions', column: 'id', onDelete: 'CASCADE' } },
      file_name: { type: 'VARCHAR(100)', nullable: false },
      file_type: { type: 'VARCHAR(100)', nullable: false },
      file_url: { type: 'VARCHAR(200)', nullable: false }
    }
  },
  cart_items: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      user_id: { type: 'INT', nullable: false, fk: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
      course_id: { type: 'INT', nullable: false, fk: { table: 'courses', column: 'id', onDelete: 'CASCADE' } },
      pricing_tier: { type: "ENUM('basic','pro','premium')", nullable: false },
      base_price: { type: 'DECIMAL(10,2)', nullable: false },
      added_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' }
    },
    constraints: {
      unique: [ { columns: ['user_id', 'course_id'], name: 'unique_user_course_cart' } ]
    }
  },
  orders: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      user_id: { type: 'INT', nullable: false, fk: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
      order_number: { type: 'VARCHAR(50)', nullable: false, unique: true },
      total_amount: { type: 'DECIMAL(10,2)', nullable: false },
      payment_status: { type: "ENUM('pending','completed','failed','refunded')", nullable: false, default: "'pending'" },
      payment_method: { type: 'VARCHAR(50)', nullable: true },
      payment_transaction_id: { type: 'VARCHAR(255)', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
      updated_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }
    }
  },
  order_items: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      order_id: { type: 'INT', nullable: false, fk: { table: 'orders', column: 'id', onDelete: 'CASCADE' } },
      course_id: { type: 'INT', nullable: false, fk: { table: 'courses', column: 'id' } },
      pricing_tier: { type: "ENUM('basic','pro','premium')", nullable: false },
      base_price: { type: 'DECIMAL(10,2)', nullable: false }
    }
  },
  coupons: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      code: { type: 'VARCHAR(50)', nullable: false, unique: true },
      description: { type: 'VARCHAR(200)', nullable: true },
      discount_type: { type: "ENUM('percentage','fixed')", nullable: false },
      discount_value: { type: 'DECIMAL(10,2)', nullable: false },
      usage_limit: { type: 'INT', nullable: true },
      used_count: { type: 'INT', nullable: false, default: '0' },
      valid_from: { type: 'DATETIME', nullable: false },
      valid_until: { type: 'DATETIME', nullable: false },
      is_active: { type: 'BOOLEAN', nullable: false, default: '1' },
      created_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' }
    }
  },
  coupon_usage: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      coupon_id: { type: 'INT', nullable: false, fk: { table: 'coupons', column: 'id' } },
      user_id: { type: 'INT', nullable: false, fk: { table: 'users', column: 'id' } },
      order_id: { type: 'INT', nullable: false, fk: { table: 'orders', column: 'id' } },
      discount_amount: { type: 'DECIMAL(10,2)', nullable: false },
      used_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' }
    }
  },
  blog_posts: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      author_id: { type: 'INT', nullable: false, fk: { table: 'users', column: 'id', onDelete: 'SET NULL' } },
      title: { type: 'VARCHAR(200)', nullable: false },
      slug: { type: 'VARCHAR(250)', nullable: false, unique: true },
      description: { type: 'TEXT', nullable: true },
      content: { type: 'LONGTEXT', nullable: false },
      featured_image: { type: 'VARCHAR(500)', nullable: true },
      category: { type: 'VARCHAR(100)', nullable: true },
      tags: { type: 'JSON', nullable: true },
      view_count: { type: 'INT', nullable: false, default: '0' },
      is_published: { type: 'BOOLEAN', nullable: false, default: '0' },
      created_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
      updated_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }
    }
  },
  testimonials: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      user_id: { type: 'INT', nullable: false, fk: { table: 'users', column: 'id' } },
      course_id: { type: 'INT', nullable: true, fk: { table: 'courses', column: 'id' } },
      name: { type: 'VARCHAR(100)', nullable: false },
      role: { type: 'VARCHAR(100)', nullable: true },
      content: { type: 'TEXT', nullable: false },
      rating: { type: 'DECIMAL(3,2)', nullable: false },
      image_url: { type: 'VARCHAR(500)', nullable: true },
      is_approved: { type: 'BOOLEAN', nullable: false, default: '0' },
      is_featured: { type: 'BOOLEAN', nullable: false, default: '0' },
      created_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' }
    }
  },
  newsletter_subscribers: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      email: { type: 'VARCHAR(100)', nullable: false, unique: true },
      name: { type: 'VARCHAR(100)', nullable: true },
      is_subscribed: { type: 'BOOLEAN', nullable: false, default: '1' },
      subscribed_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
      unsubscribed_at: { type: 'TIMESTAMP', nullable: true },
      verification_token: { type: 'VARCHAR(255)', nullable: true },
      is_verified: { type: 'BOOLEAN', nullable: false, default: '0' }
    }
  },
  course_reviews: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      user_id: { type: 'INT', nullable: false, fk: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
      course_id: { type: 'INT', nullable: false, fk: { table: 'courses', column: 'id', onDelete: 'CASCADE' } },
      rating: { type: 'DECIMAL(3,2)', nullable: false },
      review_text: { type: 'TEXT', nullable: true },
      is_approved: { type: 'BOOLEAN', nullable: false, default: '0' },
      created_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
      updated_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }
    },
    constraints: {
      unique: [ { columns: ['user_id', 'course_id'], name: 'unique_user_course_review' } ]
    }
  },
  certificates: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      user_id: { type: 'INT', nullable: false, fk: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
      course_id: { type: 'INT', nullable: false, fk: { table: 'courses', column: 'id', onDelete: 'CASCADE' } },
      certificate_number: { type: 'VARCHAR(100)', nullable: false, unique: true },
      issued_date: { type: 'DATE', nullable: false },
      certificate_url: { type: 'VARCHAR(500)', nullable: true },
      verification_code: { type: 'VARCHAR(100)', nullable: true, unique: true },
      is_valid: { type: 'BOOLEAN', nullable: false, default: '1' },
      created_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' }
    }
  },
  notifications: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      user_id: { type: 'INT', nullable: false, fk: { table: 'users', column: 'id', onDelete: 'CASCADE' } },
      title: { type: 'VARCHAR(200)', nullable: false },
      message: { type: 'TEXT', nullable: false },
      type: { type: "ENUM('info','success','warning','error')", nullable: false, default: "'info'" },
      category: { type: "ENUM('course','payment','system','marketing')", nullable: false, default: "'system'" },
      is_read: { type: 'BOOLEAN', nullable: false, default: '0' },
      action_url: { type: 'VARCHAR(500)', nullable: true },
      created_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' }
    }
  },
  email_logs: {
    columns: {
      id: { type: 'INT', nullable: false, pk: true },
      recipient_email: { type: 'VARCHAR(100)', nullable: false },
      subject: { type: 'VARCHAR(200)', nullable: false },
      template_name: { type: 'VARCHAR(100)', nullable: true },
      status: { type: "ENUM('sent','failed','bounced')", nullable: false, default: "'sent'" },
      error_message: { type: 'TEXT', nullable: true },
      sent_at: { type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' }
    }
  }
};

export default expectedSchema;
