import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/database/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '../../shared/logger';
import { AuthResponse, RegisterSchema, LoginSchema } from '../../shared/models';
import { formatUser } from '../../shared/utils/user';
import { formatConversation } from '../../shared/utils/conversation';
import { ChatRepository } from '../chat/chat.repository';

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
  private readonly chatRepository = new ChatRepository();

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
      const { token, refreshToken: newRefreshToken } = await generateTokens(
        decoded.userId,
        decoded.email,
      );

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
      const rawConversations = await this.chatRepository.getConversationsByUserId(user.id);
      const conversations = rawConversations.map((c) => formatConversation(c, true));

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
