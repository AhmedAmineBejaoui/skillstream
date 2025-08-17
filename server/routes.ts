import type { Express } from "express";
import { createServer, type Server } from "http";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { authenticate } from './middleware/auth';
import { validate } from './middleware/validation';
import { errorHandler } from './middleware/error';
import { authService } from './services/auth.service';
import { contentService } from './services/content.service';
import { newsletterService } from './services/newsletter.service';
import { ApiError, ERROR_CODES } from './utils/errors';
import { uploadAvatar } from './middleware/upload';
import { cacheMiddleware } from './middleware/cache';
import progressRoutes from './routes.progress';
import assessmentsRoutes from './routes.assessments';
import { swaggerSpec } from './docs/swagger';
import { pool } from './db';
import { coursesService } from './services/courses.service';
import { cartService } from './services/cart.service';
import { ordersService } from './services/orders.service';
import { certificatesService } from './services/certificates.service';
import {
  loginSchema,
  registerSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  blogPostSchema,
  testimonialSchema,
  newsletterSubscribeSchema,
  newsletterEmailSchema,
  newsletterPreferenceSchema,
  newsletterCampaignSchema
} from '@shared/schema';

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        message: 'Too many authentication attempts, please try again later',
        details: null,
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      }
    });
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        message: 'Too many requests, please try again later',
        details: null,
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      }
    });
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
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); // AUDIT:Tech Stack -> File Storage in server root
  app.use('/videos', express.static(path.join(process.cwd(), 'videos'))); // AUDIT:Tech Stack -> Video hosting in server root
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // AUDIT:Tech Stack -> Swagger/OpenAPI

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is healthy' });
  });

  // Sample in-memory data for demo purposes
  let userProfile = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    avatar: '',
    profile: {
      bio: 'Sample bio',
      skills: ['JavaScript'],
      experienceLevel: 'intermediate'
    },
    stats: {
      coursesEnrolled: 2,
      coursesCompleted: 1,
      certificatesEarned: 0
    }
  };

  const sampleDashboard = {
    enrolledCourses: [
      {
        id: 1,
        title: 'Sample Course',
        progress: 50,
        lastAccessed: new Date().toISOString(),
        instructor: 'Jane Smith',
        image: '/images/course.png'
      }
    ],
    recentActivity: [],
    upcomingDeadlines: [],
    certificates: []
  } as const;

  const authenticateOptional: express.RequestHandler = (req, res, next) => {
    if (!req.headers.authorization) {
      return next();
    }
    return authenticate(req, res, next);
  };

  app.use('/api/progress', authenticate, progressRoutes); // AUDIT:System Overview -> Video-based learning with progress tracking
  app.use('/api', assessmentsRoutes); // AUDIT:System Overview -> Assessment and certification system

  // Auth Routes
  app.post('/api/auth/register', authLimiter, validate(registerSchema), async (req, res, next) => {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email.',
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
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
            name: `${result.user.firstName} ${result.user.lastName}`,
            email: result.user.email,
            role: result.user.role,
            avatar: ''
          },
          token: result.accessToken,
          refreshToken: result.refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/forgot-password', authLimiter, validate(requestPasswordResetSchema), async (req, res, next) => {
    try {
      await authService.requestPasswordReset(req.body);
      res.json({
        success: true,
        message: 'Password reset email sent'
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

  app.post('/api/auth/refresh-token', async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return next(new ApiError(401, ERROR_CODES.MISSING_REQUIRED_FIELD, 'Refresh token required'));
      }

      const result = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: {
          token: result.accessToken,
          refreshToken: result.refreshToken
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


  // User Management Routes
  app.get('/api/users/profile', authenticate, (req, res) => {
    res.json({
      success: true,
      data: { user: userProfile }
    });
  });

  app.put('/api/users/profile', authenticate, (req, res) => {
    userProfile = { ...userProfile, ...req.body };
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userProfile }
    });
  });

  app.post('/api/users/upload-avatar', authenticate, uploadAvatar.single('avatar'), async (req, res, next) => {
    try {
      if (!req.file || !req.user) {
        return next(new ApiError(400, ERROR_CODES.VALIDATION_ERROR, 'File required'));
      }
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      await pool.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.user.id]);
      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: { avatarUrl }
      });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/users/dashboard', authenticate, (req, res) => {
    res.json({ success: true, data: sampleDashboard });
  });

  // Course Management Routes
  app.get('/api/courses', cacheMiddleware, async (req, res, next) => { // AUDIT:Tech Stack -> simple caching
    try {
      const data = await coursesService.listCourses(req.query);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/courses/:id', authenticateOptional, async (req, res, next) => {
    try {
      const data = await coursesService.getCourseById(Number(req.params.id));
      if (!data) {
        return next(new ApiError(404, ERROR_CODES.COURSE_NOT_FOUND, 'Course not found'));
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  });

  // E-commerce Routes
  app.get('/api/cart', authenticate, async (req: any, res, next) => {
    try {
      const data = await cartService.getCart(req.user.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/cart/add', authenticate, async (req: any, res, next) => {
    try {
      const { cartItem, cartTotal } = await cartService.addItem(
        req.user.id,
        req.body.courseId,
        req.body.pricingTier
      );
      res.json({
        success: true,
        message: 'Course added to cart',
        data: { cartItem, cartTotal }
      });
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/cart/remove/:courseId', authenticate, async (req: any, res, next) => {
    try {
      const cartTotal = await cartService.removeItem(req.user.id, Number(req.params.courseId));
      res.json({ success: true, message: 'Course removed from cart', data: { cartTotal } });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/orders/create', authenticate, async (req: any, res, next) => {
    try {
      const order = await ordersService.createOrder(req.user.id, req.body.couponCode);
      res.json({ success: true, data: { order } });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/orders/:orderId/confirm-payment', authenticate, async (req, res, next) => {
    try {
      const order = await ordersService.confirmPayment(Number(req.params.orderId));
      res.json({
        success: true,
        message: 'Payment confirmed and courses enrolled',
        data: { order }
      });
    } catch (err) {
      next(err);
    }
  });

  // Content Management Routes
  app.get('/api/blog', cacheMiddleware, (req, res) => { // AUDIT:Tech Stack -> simple caching
    res.json({ success: true, data: { posts: contentService.getPosts() } });
  });

  app.post('/api/blog', validate(blogPostSchema), (req, res) => {
    const post = contentService.addPost(req.body);
    res.status(201).json({ success: true, data: { post } });
  });

  app.get('/api/testimonials', (req, res) => {
    res.json({ success: true, data: { testimonials: contentService.getTestimonials() } });
  });

  app.post('/api/testimonials', validate(testimonialSchema), (req, res) => {
    const testimonial = contentService.addTestimonial(req.body);
    res.status(201).json({ success: true, data: { testimonial } });
  });

  // Assessment & Certification Routes
  app.get('/api/certificates/:id/verify', async (req, res) => {
    const valid = await certificatesService.verifyCertificate(req.params.id);
    res.json({ success: true, data: { valid } });
  });

  // Newsletter Routes
  app.post('/api/newsletter/subscribe', validate(newsletterSubscribeSchema), (req, res) => {
    const subscriber = newsletterService.subscribe(req.body);
    res.status(201).json({ success: true, data: { subscriber } });
  });

  app.post('/api/newsletter/unsubscribe', validate(newsletterEmailSchema), (req, res) => {
    newsletterService.unsubscribe(req.body.email);
    res.json({ success: true, message: 'Unsubscribed successfully' });
  });

  app.post('/api/newsletter/preferences', validate(newsletterPreferenceSchema), (req, res) => {
    const subscriber = newsletterService.updatePreferences(req.body);
    res.json({ success: true, data: { subscriber } });
  });

  app.post('/api/newsletter/campaign', validate(newsletterCampaignSchema), async (req, res) => {
    const sent = await newsletterService.sendCampaign(req.body);
    res.json({ success: true, data: { sent } });
  });
  // Error handling middleware
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}
