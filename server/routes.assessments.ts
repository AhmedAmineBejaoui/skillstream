import { Router } from 'express';
import { authenticate } from './middleware/auth';
import { assessmentsService } from './services/assessments.service';

// AUDIT:System Overview -> Assessment and certification system

const router = Router();

router.post('/assessments/:quizId/attempts', authenticate, async (req: any, res, next) => {
  try {
    const data = await assessmentsService.createAttempt(req.user.id, Number(req.params.quizId));
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/assessments/attempts/:attemptId/submit', authenticate, async (req: any, res, next) => {
  try {
    const data = await assessmentsService.submitAttempt(req.user.id, Number(req.params.attemptId), req.body.answers);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
