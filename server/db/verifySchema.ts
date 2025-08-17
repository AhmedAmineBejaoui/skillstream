import { pool } from '../db.ts';

// AUDIT:Database Schema -> schema evidence

const schema: Record<string, string[]> = {
  users: ['id','first_name','last_name','email','phone','age','password_hash','avatar_url','role','is_verified','email_verification_token','password_reset_token','password_reset_expires','created_at','updated_at'],
  user_profiles: ['id','user_id','bio','linkedin_url','github_url','skills','experience_level'],
  categories: ['id','name','description','icon','color','is_active','sort_order','created_at'],
  instructors: ['id','user_id','title','experience_years','total_students','total_courses','rating','bio','expertise','created_at'],
  courses: ['id','title','slug','description','category_id','instructor_id','image_url','trailer_video_url','level','duration','language','requirements','learning_objectives','tags','rating','student_count','is_certified','last_updated','is_published','created_at','updated_at'],
  course_pricing: ['id','course_id','tier','price','original_price','features','is_active'],
  chapters: ['id','course_id','title','description','sort_order','estimated_duration_minutes','is_locked','created_at'],
  lessons: ['id','chapter_id','title','description','type','video_url','presentation_url','overview','sort_order','is_preview','created_at'],
  exercises: ['id','lesson_id','title','description','instructions','is_complete'],
  quizzes: ['id','chapter_id','title','questions','passing_score','time_limit_minutes','attempts_allowed','created_at'],
  user_course_progress: ['id','user_id','course_id','enrollment_date','completion_date','progress_percentage','last_accessed','pricing_tier','status'],
  user_lesson_progress: ['id','user_id','lesson_id','is_completed','completion_date','watch_time_seconds','created_at','updated_at'],
  quiz_attempts: ['id','user_id','quiz_id','score','answers','started_at','completed_at','time_taken_minutes','is_passed','attempt_number'],
  exams: ['id','course_id','title','description','instructions','requirements','duration_hours','total_marks','passing_marks','attempts_limit','created_at'],
  exam_resources: ['id','exam_id','file_name','file_description','file_type','file_url'],
  exam_submissions: ['id','user_id','exam_id','submission_notes','started_at','submitted_at','graded_at','score','feedback','status','attempt_number'],
  exam_submission_files: ['id','submission_id','file_name','file_type','file_url'],
  cart_items: ['id','user_id','course_id','pricing_tier','base_price','added_at'],
  orders: ['id','user_id','order_number','total_amount','payment_status','payment_method','payment_transaction_id','created_at','updated_at'],
  order_items: ['id','order_id','course_id','pricing_tier','base_price'],
  coupons: ['id','code','description','discount_type','discount_value','usage_limit','used_count','valid_from','valid_until','is_active','created_at'],
  coupon_usage: ['id','coupon_id','user_id','order_id','discount_amount','used_at'],
  blog_posts: ['id','author_id','title','slug','description','content','featured_image','category','tags','view_count','is_published','created_at','updated_at'],
  testimonials: ['id','user_id','course_id','name','role','content','rating','image_url','is_approved','is_featured','created_at'],
  newsletter_subscribers: ['id','email','name','is_subscribed','subscribed_at','unsubscribed_at','verification_token','is_verified'],
  course_reviews: ['id','user_id','course_id','rating','review_text','is_approved','created_at','updated_at'],
  certificates: ['id','user_id','course_id','certificate_number','issued_date','certificate_url','verification_code','is_valid','created_at'],
  notifications: ['id','user_id','title','message','type','category','is_read','action_url','created_at'],
  email_logs: ['id','recipient_email','subject','template_name','status','error_message','sent_at']
};

async function verify() {
  const [verRows] = await pool.query<any[]>('SELECT VERSION() AS v');
  const version = verRows[0].v as string;
  const major = parseInt(version.split('.')[0]);
  console.log(`MySQL version: ${version}`); // AUDIT:Tech Stack -> MySQL 8.0+ evidence
  if (major >= 8) {
    console.log('MySQL 8.0+ requirement: OK');
  } else {
    console.log('MySQL 8.0+ requirement: NON');
  }

  for (const [table, columns] of Object.entries(schema)) {
    const [tables] = await pool.query<any>(`SHOW TABLES LIKE ?`, [table]);
    if (tables.length === 0) {
      console.log(`Table ${table}: MISSING`);
      continue;
    }
    console.log(`Table ${table}: OK`);
    const [cols] = await pool.query<any>(`SHOW COLUMNS FROM \`${table}\``);
    const colNames = cols.map((c: any) => c.Field);
    for (const col of columns) {
      if (colNames.includes(col)) {
        console.log(`  Column ${col}: OK`);
      } else {
        console.log(`  Column ${col}: MISSING`);
      }
    }
  }
  await pool.end();
}

verify();
