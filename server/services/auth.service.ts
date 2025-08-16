import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, type User, type LoginRequest, type RegisterRequest } from '@shared/schema';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateTokenPair, type TokenPayload } from '../utils/jwt';
import { randomBytes } from 'crypto';

export class AuthService {
  async register(data: RegisterRequest): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email)
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);
    
    // Generate public ID (ULID)
    const publicId = randomBytes(13).toString('base64url');

    // Create user
    const [newUser] = await db.insert(users).values({
      publicId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      age: data.age,
      passwordHash,
      role: data.role || 'student'
    }).returning();

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      tokenVersion: newUser.tokenVersion
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    return { user: newUser, accessToken, refreshToken };
  }

  async login(data: LoginRequest): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email)
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValid = await comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    return { user, accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = require('../utils/jwt').verifyRefreshToken(refreshToken);
      
      // Verify user exists and token version matches
      const user = await db.query.users.findFirst({
        where: eq(users.id, payload.userId)
      });

      if (!user || user.tokenVersion !== payload.tokenVersion) {
        throw new Error('Invalid refresh token');
      }

      const newTokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion
      };

      return generateTokenPair(newTokenPayload);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async revokeToken(userId: number): Promise<void> {
    await db.update(users)
      .set({ tokenVersion: require('drizzle-orm').sql`${users.tokenVersion} + 1` })
      .where(eq(users.id, userId));
  }
}

export const authService = new AuthService();
