import type { Express } from "express";
import { createServer, type Server } from "http";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authenticate, authorize } from './middleware/auth';
import { validate } from './middleware/validation';
import { authService } from './services/auth.service';
import { userService } from './services/user.service';
import { courseService } from './services/course.service';
import {
  loginSchema,
  registerSchema,
  insertCourseSchema,
  insertCategorySchema,
  requestPasswordResetSchema,
  resetPasswordSchema
} from '@shared/schema';

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts, please try again later'
    }
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later'
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Trust proxy for rate limiting with specific configuration
  app.set('trust proxy', 1);
  
  // Middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:"]
      }
    }
  }));
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    credentials: true
  }));
  app.use(generalLimiter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is healthy' });
  });

  // Auth Routes
  app.post('/api/auth/register', authLimiter, validate(registerSchema), async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      
      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            publicId: result.user.publicId,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            email: result.user.email,
            role: result.user.role
          },
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/login', authLimiter, validate(loginSchema), async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      
      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            publicId: result.user.publicId,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            email: result.user.email,
            role: result.user.role
          },
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/request-password-reset', authLimiter, validate(requestPasswordResetSchema), async (req, res, next) => {
    try {
      await authService.requestPasswordReset(req.body);
      res.json({
        success: true,
        message: 'If that email is registered, a reset link has been sent'
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/reset-password', authLimiter, validate(resetPasswordSchema), async (req, res, next) => {
    try {
      await authService.resetPassword(req.body);
      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/refresh', async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'REFRESH_TOKEN_REQUIRED',
            message: 'Refresh token required'
          }
        });
      }

      const result = await authService.refreshToken(refreshToken);
      
      // Set new refresh token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        data: {
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/logout', authenticate, async (req, res, next) => {
    try {
      await authService.revokeToken(req.user!.id);
      res.clearCookie('refreshToken');
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  });

  // User Routes
  app.get('/api/users/me', authenticate, async (req, res, next) => {
    try {
      const user = await userService.getUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          publicId: user.publicId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          profile: (user as any).profile,
          instructor: (user as any).instructor
        }
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/users', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
      const users = await userService.getAllUsers();
      res.json({
        success: true,
        data: users.map(user => ({
          id: user.id,
          publicId: user.publicId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }))
      });
    } catch (error) {
      next(error);
    }
  });

  // Course Routes
  app.get('/api/courses', async (req, res, next) => {
    try {
      const {
        category,
        level,
        language,
        search,
        published,
        limit = 20,
        offset = 0
      } = req.query;

      const result = await courseService.getAllCourses({
        category: category as string,
        level: level as string,
        language: language as string,
        search: search as string,
        isPublished: published === 'true',
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });

      res.json({
        success: true,
        data: result.courses,
        pagination: {
          total: result.total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasNext: result.total > parseInt(offset as string) + parseInt(limit as string),
          hasPrev: parseInt(offset as string) > 0
        }
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/courses/:id', async (req, res, next) => {
    try {
      const course = await courseService.getCourseById(parseInt(req.params.id));
      if (!course) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'COURSE_NOT_FOUND',
            message: 'Course not found'
          }
        });
      }

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/courses', authenticate, authorize(['instructor', 'admin']), validate(insertCourseSchema), async (req, res, next) => {
    try {
      const course = await courseService.createCourse(req.body);
      res.status(201).json({
        success: true,
        data: course
      });
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/courses/:id', authenticate, authorize(['instructor', 'admin']), async (req, res, next) => {
    try {
      const course = await courseService.updateCourse(parseInt(req.params.id), req.body);
      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/courses/:id', authenticate, authorize(['instructor', 'admin']), async (req, res, next) => {
    try {
      await courseService.deleteCourse(parseInt(req.params.id));
      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  });

  // Category Routes
  app.get('/api/categories', async (req, res, next) => {
    try {
      const categories = await courseService.getAllCategories();
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/categories', authenticate, authorize(['admin']), validate(insertCategorySchema), async (req, res, next) => {
    try {
      const category = await courseService.createCategory(req.body);
      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  });

  // Chapter Routes
  app.post('/api/courses/:courseId/chapters', authenticate, authorize(['instructor', 'admin']), async (req, res, next) => {
    try {
      const chapter = await courseService.createChapter(parseInt(req.params.courseId), req.body);
      res.status(201).json({
        success: true,
        data: chapter
      });
    } catch (error) {
      next(error);
    }
  });

  // Lesson Routes
  app.post('/api/chapters/:chapterId/lessons', authenticate, authorize(['instructor', 'admin']), async (req, res, next) => {
    try {
      const lesson = await courseService.createLesson(parseInt(req.params.chapterId), req.body);
      res.status(201).json({
        success: true,
        data: lesson
      });
    } catch (error) {
      next(error);
    }
  });

  // Error handling middleware
  app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', error);
    
    const status = error.status || error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(status).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message,
        traceId: req.headers['x-request-id'] || 'unknown'
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
