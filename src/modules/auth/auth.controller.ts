import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/database/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '../../shared/logger';
import { AuthResponse, RegisterSchema, LoginSchema } from '../../shared/models';
import { formatUser } from '../../shared/utils/user';
import { formatConversation } from '../../shared/utils/conversation';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';
const JWT_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';
const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

async function generateTokens(userId: string, email: string) {
  const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId, expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS) },
  });
  return { token, refreshToken };
}

export class AuthController {
  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user account
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - firstName
   *               - lastName
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 minLength: 6
   *                 example: password123
   *               firstName:
   *                 type: string
   *                 example: John
   *               lastName:
   *                 type: string
   *                 example: Doe
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                   example: jwt_token_here
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       example: clx123abc
   *                     email:
   *                       type: string
   *                       format: email
   *                       example: user@example.com
   *                     firstName:
   *                       type: string
   *                       example: John
   *                     lastName:
   *                       type: string
   *                       example: Doe
   *       400:
   *         description: Invalid credentials or missing required fields
   *       409:
   *         description: Email already exists
   *       500:
   *         description: Internal server error
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const validation = RegisterSchema.safeParse(req.body);

      if (!validation.success) {
        logger.warn('Register failed: Invalid credentials');
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      const { email, password, firstName, lastName } = validation.data;

      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({ message: 'All fields are required' });
        return;
      }

      logger.debug(`DB read: user.findUnique email=${email}`);
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(409).json({ message: 'Email already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      logger.debug(`DB write: user.create email=${email}`);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
      });

      const { token, refreshToken } = await generateTokens(user.id, user.email);

      res.status(201).json({
        token,
        refreshToken,
        user: formatUser(user),
      });

      logger.info(`User ${firstName} (${email}) registered successfully`);
    } catch (error) {
      logger.error('Register error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Authenticate user and return access token
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 example: password123
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       example: clx123abc
   *                     email:
   *                       type: string
   *                       format: email
   *                       example: user@example.com
   *                     firstName:
   *                       type: string
   *                       example: John
   *                     lastName:
   *                       type: string
   *                       example: Doe
   *                 token:
   *                   type: string
   *                   example: jwt_token_here
   *                 conversations:
   *                   type: array
   *                   items:
   *                     type: object
   *       400:
   *         description: Invalid credentials payload
   *       401:
   *         description: Invalid email or password
   *       500:
   *         description: Internal server error
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(401).json({ message: 'Refresh token missing' });
        return;
      }

      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string; email: string };

      const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
      if (!stored || stored.expiresAt < new Date()) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
        return;
      }

      // Rotate: delete old, issue new pair
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      const { token, refreshToken: newRefreshToken } = await generateTokens(decoded.userId, decoded.email);

      logger.info(`Tokens rotated for userId=${decoded.userId}`);
      res.status(200).json({ token, refreshToken: newRefreshToken });
    } catch (error) {
      logger.warn('Token refresh failed: invalid or expired token');
      res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const validation = LoginSchema.safeParse(req.body);

      if (!validation.success) {
        logger.warn('Login failed: Invalid credentials');
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      const { email, password } = validation.data;

      logger.debug(`DB read: user.findUnique email=${email}`);
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        logger.warn(`Login failed: Invalid credentials for email ${email}`);
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        logger.warn(`Login failed: Invalid credentials for email ${email}`);
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      logger.debug(`DB read: conversation.findMany userId=${user.id}`);
      const rawConversations = await prisma.conversation.findMany({
        where: { participants: { some: { userId: user.id } } },
        include: { messages: true, participants: true },
      });
      const conversations = rawConversations.map(formatConversation);

      const { token, refreshToken } = await generateTokens(user.id, user.email);

      res.status(200).json({
        user: formatUser(user),
        token,
        refreshToken,
        conversations,
      } as AuthResponse);

      logger.info(`Login successful for user ${user.id} (${email})`);
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
