import type { Express } from "express";
import { createServer, type Server } from "http";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authenticate } from './middleware/auth';
import { validate } from './middleware/validation';
import { errorHandler } from './middleware/error';
import { authService } from './services/auth.service';
import { ApiError, ERROR_CODES } from './utils/errors';
import {
  loginSchema,
  registerSchema,
  requestPasswordResetSchema,
  resetPasswordSchema
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

  const sampleCourses = [
    {
      id: 1,
      title: 'Sample Course',
      description: 'An example course',
      image: '/images/course.png',
      category: 'Development',
      level: 'beginner',
      duration: '4h',
      instructor: {
        name: 'Jane Smith',
        avatar: '',
        title: 'Senior Dev'
      },
      pricing: {
        basic: { price: 10, originalPrice: 20 },
        pro: { price: 20, originalPrice: 40 },
        premium: { price: 30, originalPrice: 60 }
      },
      rating: 4.5,
      reviewCount: 10,
      studentCount: 100,
      tags: ['sample']
    }
  ] as const;

  let cart: any[] = [];
  let orders: any[] = [];

  const authenticateOptional: express.RequestHandler = (req, res, next) => {
    if (!req.headers.authorization) {
      return next();
    }
    return authenticate(req, res, next);
  };

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

  app.post('/api/users/upload-avatar', authenticate, (req, res) => {
    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatarUrl: '/images/avatar.png' }
    });
  });

  app.get('/api/users/dashboard', authenticate, (req, res) => {
    res.json({ success: true, data: sampleDashboard });
  });

  // Course Management Routes
  app.get('/api/courses', (req, res) => {
    res.json({
      success: true,
      data: {
        courses: sampleCourses,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCourses: sampleCourses.length,
          hasNext: false,
          hasPrev: false
        },
        filters: {
          categories: ['Development'],
          levels: ['beginner', 'intermediate', 'advanced'],
          priceRange: { min: 0, max: 100 }
        }
      }
    });
  });

  app.get('/api/courses/:id', authenticateOptional, (req, res, next) => {
    const course = sampleCourses.find(c => c.id === Number(req.params.id));
    if (!course) {
      return next(new ApiError(404, ERROR_CODES.COURSE_NOT_FOUND, 'Course not found'));
    }
    const courseDetail = {
      ...course,
      trailerVideo: '',
      totalDuration: '4h',
      language: 'English',
      lastUpdated: new Date().toISOString(),
      instructor: {
        name: course.instructor.name,
        title: course.instructor.title,
        avatar: course.instructor.avatar,
        experience: '5 years',
        totalStudents: 1000,
        totalCourses: 5
      },
      features: ['Feature 1'],
      requirements: ['Requirement 1'],
      learningObjectives: ['Objective 1'],
      chapters: [
        {
          id: 1,
          title: 'Introduction',
          description: '',
          duration: '1h',
          lessonCount: 5,
          isLocked: false,
          isCompleted: false
        }
      ]
    };
    res.json({ success: true, data: { course: courseDetail, isEnrolled: false, userProgress: 0 } });
  });

  // E-commerce Routes
  app.get('/api/cart', authenticate, (req, res) => {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    res.json({ success: true, data: { items: cart, total, itemCount: cart.length } });
  });

  app.post('/api/cart/add', authenticate, (req, res, next) => {
    const course = sampleCourses.find(c => c.id === req.body.courseId);
    if (!course) {
      return next(new ApiError(404, ERROR_CODES.COURSE_NOT_FOUND, 'Course not found'));
    }
    const price = course.pricing[req.body.pricingTier as keyof typeof course.pricing]?.price ?? 0;
    const cartItem = {
      id: Date.now(),
      course: {
        id: course.id,
        title: course.title,
        image: course.image,
        category: course.category
      },
      pricingTier: req.body.pricingTier,
      price,
      addedAt: new Date().toISOString()
    };
    cart.push(cartItem);
    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
    res.json({
      success: true,
      message: 'Course added to cart',
      data: { cartItem, cartTotal }
    });
  });

  app.delete('/api/cart/remove/:courseId', authenticate, (req, res) => {
    cart = cart.filter(item => item.course.id !== Number(req.params.courseId));
    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
    res.json({ success: true, message: 'Course removed from cart', data: { cartTotal } });
  });

  app.post('/api/orders/create', authenticate, (req, res) => {
    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
    const order = {
      id: orders.length + 1,
      orderNumber: `ORD-${Date.now()}`,
      totalAmount,
      paymentIntent: 'pi_123',
      clientSecret: 'secret_123',
      items: cart.slice(),
      status: 'pending'
    };
    orders.push(order);
    res.json({ success: true, data: { order: { id: order.id, orderNumber: order.orderNumber, totalAmount: order.totalAmount, paymentIntent: order.paymentIntent, clientSecret: order.clientSecret } } });
  });

  app.post('/api/orders/:orderId/confirm-payment', authenticate, (req, res, next) => {
    const order = orders.find(o => o.id === Number(req.params.orderId));
    if (!order) {
      return next(new ApiError(404, ERROR_CODES.VALIDATION_ERROR, 'Order not found'));
    }
    order.status = 'completed';
    res.json({
      success: true,
      message: 'Payment confirmed and courses enrolled',
      data: { order: { status: order.status, enrolledCourses: order.items.map((i: any) => i.course.id) } }
    });
  });
  // Error handling middleware
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}
