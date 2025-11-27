import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { prisma } from '../server';
import { sendSuccess, sendError } from '../utils/response';
import { registerSchema, loginSchema } from '../utils/validation';
import { authenticate } from '../middleware/auth';

/**
 * Authentication Routes
 * Handles user registration, login, token refresh, and logout
 */

interface RegisterBody {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export default async function authRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  fastify.post('/register', async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
    try {
      // Validate request body
      const data = registerSchema.parse(request.body);

      // Normalize email to lowercase
      const email = data.email.toLowerCase();

      // Check if user already exists (case-insensitive)
      const existingUser = await prisma.user.findFirst({
        where: { 
          email: {
            equals: email,
            mode: 'insensitive'
          }
        },
      });

      if (existingUser) {
        return sendError(reply, 'User with this email already exists', 409, 'USER_EXISTS');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'FREE',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      });

      // Generate tokens
      const accessToken = fastify.jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
      );

      const refreshToken = fastify.jwt.sign(
        { id: user.id, type: 'refresh' },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
      );

      // Save refresh token
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED',
          entity: 'User',
          entityId: user.id,
        },
      });

      return sendSuccess(
        reply,
        {
          user,
          accessToken,
          refreshToken,
        },
        201
      );
    } catch (error) {
      throw error;
    }
  });

  /**
   * POST /api/auth/login
   * Login user
   */
  fastify.post('/login', async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    try {
      // Validate request body
      const data = loginSchema.parse(request.body);
      console.log('🔐 Login attempt for email:', data.email);

      // Find user (case-insensitive email search)
      const user = await prisma.user.findFirst({
        where: { 
          email: {
            equals: data.email,
            mode: 'insensitive'
          }
        },
      });

      console.log('👤 User found:', user ? `Yes (ID: ${user.id}, Active: ${user.isActive})` : 'No');

      if (!user || !user.isActive) {
        console.log('❌ Login failed: User not found or inactive');
        return sendError(reply, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      // Verify password
      console.log('🔑 Comparing password...');
      const validPassword = await bcrypt.compare(data.password, user.passwordHash);
      console.log('✅ Password valid:', validPassword);
      
      if (!validPassword) {
        console.log('❌ Login failed: Invalid password');
        return sendError(reply, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      // Generate tokens
      const accessToken = fastify.jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
      );

      const refreshToken = fastify.jwt.sign(
        { id: user.id, type: 'refresh' },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
      );

      // Save refresh token
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'USER_LOGGED_IN',
          entity: 'User',
          entityId: user.id,
        },
      });

      return sendSuccess(reply, {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      throw error;
    }
  });

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  fastify.post('/refresh', async (request: FastifyRequest<{ Body: { refreshToken: string } }>, reply: FastifyReply) => {
    try {
      const { refreshToken } = request.body;

      if (!refreshToken) {
        return sendError(reply, 'Refresh token required', 400, 'MISSING_REFRESH_TOKEN');
      }

      // Verify refresh token
      let decoded: any;
      try {
        decoded = fastify.jwt.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
      } catch (error) {
        return sendError(reply, 'Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      // Find user and verify refresh token
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || user.refreshToken !== refreshToken || !user.isActive) {
        return sendError(reply, 'Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      // Generate new access token
      const newAccessToken = fastify.jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
      );

      return sendSuccess(reply, { accessToken: newAccessToken });
    } catch (error) {
      throw error;
    }
  });

  /**
   * POST /api/auth/logout
   * Logout user (invalidate refresh token)
   */
  fastify.post('/logout', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as any;

      // Clear refresh token
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'USER_LOGGED_OUT',
          entity: 'User',
          entityId: user.id,
        },
      });

      return sendSuccess(reply, { message: 'Logged out successfully' });
    } catch (error) {
      throw error;
    }
  });

  /**
   * GET /api/auth/me
   * Get current user profile
   */
  fastify.get('/me', { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as any;

      const profile = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!profile) {
        return sendError(reply, 'User not found', 404, 'USER_NOT_FOUND');
      }

      return sendSuccess(reply, profile);
    } catch (error) {
      throw error;
    }
  });
}
