import { pool } from '../db';
import { certificatesService } from './certificates.service';
import { ApiError, ERROR_CODES } from '../utils/errors';

// AUDIT:System Overview -> Assessment and certification system

export const assessmentsService = {
  async createAttempt(userId: number, quizId: number) {
    const [[quiz]] = await pool.query<any[]>(
      `SELECT id, questions, passing_score, time_limit_minutes, attempts_allowed FROM quizzes WHERE id = ?`,
      [quizId]
    );
    if (!quiz) {
      throw new ApiError(404, ERROR_CODES.VALIDATION_ERROR, 'Quiz not found');
    }
    const [[countRow]] = await pool.query<any[]>(
      `SELECT COUNT(*) AS cnt FROM quiz_attempts WHERE user_id = ? AND quiz_id = ?`,
      [userId, quizId]
    );
    const attemptNumber = countRow.cnt + 1;
    if (attemptNumber > quiz.attempts_allowed) {
      throw new ApiError(400, ERROR_CODES.VALIDATION_ERROR, 'Max attempts reached');
    }
    const [result] = await pool.query<any>(
      `INSERT INTO quiz_attempts (user_id, quiz_id, attempt_number) VALUES (?,?,?)`,
      [userId, quizId, attemptNumber]
    );
    return { attemptId: result.insertId, attemptNumber, timeLimitMinutes: quiz.time_limit_minutes };
  },

  async submitAttempt(userId: number, attemptId: number, answers: any[]) {
    const [[attempt]] = await pool.query<any[]>(
      `SELECT qa.*, q.questions, q.passing_score, q.chapter_id
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.id = ? AND qa.user_id = ?`,
      [attemptId, userId]
    );
    if (!attempt) {
      throw new ApiError(404, ERROR_CODES.VALIDATION_ERROR, 'Attempt not found');
    }
    const questions = JSON.parse(attempt.questions);
    let correct = 0;
    for (const q of questions) {
      const userAnswer = answers.find(a => a.question_id === q.id)?.answer_id;
      if (userAnswer !== undefined && userAnswer === q.correct_answer_id) {
        correct++;
      }
    }
    const score = (correct / questions.length) * 100;
    const isPassed = score >= attempt.passing_score;
    const timeTaken = Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 60000);
    await pool.query(
      `UPDATE quiz_attempts SET score = ?, answers = ?, completed_at = NOW(), time_taken_minutes = ?, is_passed = ? WHERE id = ?`,
      [score, JSON.stringify(answers), timeTaken, isPassed ? 1 : 0, attemptId]
    );

    let certificateId: number | undefined;
    if (isPassed) {
      const [[courseRow]] = await pool.query<any[]>(
        `SELECT c.id, c.is_certified FROM quizzes q
         JOIN chapters ch ON q.chapter_id = ch.id
         JOIN courses c ON ch.course_id = c.id
         WHERE q.id = ?`,
        [attempt.quiz_id]
      );
      if (courseRow && courseRow.is_certified) {
        certificateId = await certificatesService.createCertificate(userId, courseRow.id);
      }
    }
    return { score, isPassed, certificateId };
  }
};
