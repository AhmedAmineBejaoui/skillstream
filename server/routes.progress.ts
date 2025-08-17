import { Router } from 'express';
import { pool } from './db';

// AUDIT:System Overview -> Video-based learning with progress tracking

const router = Router();

router.post('/lesson/:lessonId/watch-time', async (req, res, next) => {
  try {
    const lessonId = Number(req.params.lessonId);
    const seconds = Number(req.body.seconds || 0);
    const userId = req.user!.id;
    await pool.query(
      `INSERT INTO user_lesson_progress (user_id, lesson_id, watch_time_seconds)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE watch_time_seconds = watch_time_seconds + VALUES(watch_time_seconds), updated_at = NOW()`,
      [userId, lessonId, seconds]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/lesson/:lessonId/complete', async (req, res, next) => {
  try {
    const lessonId = Number(req.params.lessonId);
    const userId = req.user!.id;
    await pool.query(
      `INSERT INTO user_lesson_progress (user_id, lesson_id, is_completed, completion_date)
       VALUES (?, ?, true, NOW())
       ON DUPLICATE KEY UPDATE is_completed = true, completion_date = NOW(), updated_at = NOW()`,
      [userId, lessonId]
    );
    const [courseRow] = await pool.query<any>(
      `SELECT c.course_id FROM lessons l JOIN chapters c ON l.chapter_id = c.id WHERE l.id = ?`,
      [lessonId]
    );
    const courseId = courseRow[0].course_id;
    const [totalRow] = await pool.query<any>(
      `SELECT COUNT(*) as total FROM lessons l JOIN chapters ch ON l.chapter_id = ch.id WHERE ch.course_id = ?`,
      [courseId]
    );
    const total = totalRow[0].total as number;
    const [completedRow] = await pool.query<any>(
      `SELECT COUNT(*) as completed FROM user_lesson_progress ulp JOIN lessons l ON ulp.lesson_id = l.id JOIN chapters ch ON l.chapter_id = ch.id WHERE ulp.user_id = ? AND ulp.is_completed = true AND ch.course_id = ?`,
      [userId, courseId]
    );
    const completed = completedRow[0].completed as number;
    const percentage = total ? (completed / total) * 100 : 0;
    const [existing] = await pool.query<any>(
      `SELECT pricing_tier FROM user_course_progress WHERE user_id = ? AND course_id = ?`,
      [userId, courseId]
    );
    const tier = existing[0]?.pricing_tier || 'basic';
    await pool.query(
      `INSERT INTO user_course_progress (user_id, course_id, progress_percentage, pricing_tier)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE progress_percentage = VALUES(progress_percentage)`,
      [userId, courseId, percentage, tier]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get('/course/:courseId', async (req, res, next) => {
  try {
    const courseId = Number(req.params.courseId);
    const userId = req.user!.id;
    const [progressRows] = await pool.query<any>(
      `SELECT progress_percentage FROM user_course_progress WHERE user_id = ? AND course_id = ?`,
      [userId, courseId]
    );
    const progress = progressRows[0]?.progress_percentage || 0;
    const [lessonRows] = await pool.query<any>(
      `SELECT ulp.lesson_id FROM user_lesson_progress ulp JOIN lessons l ON ulp.lesson_id = l.id JOIN chapters ch ON l.chapter_id = ch.id WHERE ulp.user_id = ? AND ulp.is_completed = true AND ch.course_id = ?`,
      [userId, courseId]
    );
    const completedLessons = lessonRows.map((r: any) => r.lesson_id);
    res.json({ success: true, data: { progressPercentage: progress, completedLessons } });
  } catch (err) {
    next(err);
  }
});

export default router;
