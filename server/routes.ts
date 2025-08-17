import type { Express } from "express";
import { createServer, type Server } from "http";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authenticate } from './middleware/auth';
import { validate } from './middleware/validation';
import { authService } from './services/auth.service';
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
