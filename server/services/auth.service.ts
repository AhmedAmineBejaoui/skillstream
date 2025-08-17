import { pool } from '../db';
import { type User, type LoginRequest, type RegisterRequest, type RequestPasswordReset, type ResetPasswordRequest } from '@shared/schema';

import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateTokenPair, type TokenPayload, verifyRefreshToken } from '../utils/jwt';
import { randomBytes } from 'crypto';
import { ResultSetHeader } from 'mysql2';
import { ApiError, ERROR_CODES } from '../utils/errors';

export class AuthService {
  async register(data: RegisterRequest): Promise<User> {
    const [existing] = await pool.query<any>('SELECT * FROM users WHERE email = ?', [data.email]);
    const existingUser = (existing as User[])[0];
    if (existingUser) {
      throw new ApiError(409, ERROR_CODES.VALIDATION_ERROR, 'User already exists with this email');
    }

    const passwordHash = await hashPassword(data.password);
    const publicId = randomBytes(13).toString('base64url');

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (public_id, first_name, last_name, email, phone, age, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [publicId, data.firstName, data.lastName, data.email, data.phone ?? null, data.age ?? null, passwordHash, data.role || 'student']
    );

    const [rows] = await pool.query<any>('SELECT * FROM users WHERE id = ?', [(result as ResultSetHeader).insertId]);
    const newUser = (rows as User[])[0];

    return newUser;
  }

  async login(data: LoginRequest): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const [rows] = await pool.query<any>('SELECT * FROM users WHERE email = ?', [data.email]);
    const user = (rows as User[])[0];
    if (!user) {
      throw new ApiError(401, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid email or password');
    }

    const isValid = await comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new ApiError(401, ERROR_CODES.INVALID_CREDENTIALS, 'Invalid email or password');
    }

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
      const payload = verifyRefreshToken(refreshToken);
      const [rows] = await pool.query<any>('SELECT * FROM users WHERE id = ?', [payload.userId]);
      const user = (rows as User[])[0];
      if (!user || user.tokenVersion !== payload.tokenVersion) {
        throw new ApiError(401, ERROR_CODES.TOKEN_INVALID, 'Invalid refresh token');
      }
      const newPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion
      };
      return generateTokenPair(newPayload);
    } catch (err) {
      throw new ApiError(401, ERROR_CODES.TOKEN_INVALID, 'Invalid refresh token');
    }
  }

  async revokeToken(userId: number): Promise<void> {
    await pool.query('UPDATE users SET token_version = token_version + 1 WHERE id = ?', [userId]);
  }

  async requestPasswordReset(data: RequestPasswordReset): Promise<void> {
    const [rows] = await pool.query<any>('SELECT * FROM users WHERE email = ?', [data.email]);
    const user = (rows as User[])[0];
    if (!user) {
      return;
    }
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await pool.query('UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?', [token, expires, user.id]);
    // send token via email in production
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    const [rows] = await pool.query<any>('SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()', [data.token]);
    const user = (rows as User[])[0];
    if (!user) {
      throw new ApiError(401, ERROR_CODES.TOKEN_INVALID, 'Invalid or expired password reset token');
    }
    const passwordHash = await hashPassword(data.password);
    await pool.query(
      'UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
      [passwordHash, user.id]
    );
  }
}

export const authService = new AuthService();
