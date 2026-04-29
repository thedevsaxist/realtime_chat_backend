import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/database/prisma';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { userId, password } = req.body;

      // Hardcoded default credentials for two users
      const validUsers: Record<string, string> = {
        'user-1': 'pass1',
        'user-2': 'pass2',
      };

      if (!userId || !password || validUsers[userId] !== password) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Fetch all available conversations
      // Currently assuming all connected users have access to the seeded conversation
      const rawConversations = await prisma.conversation.findMany();
      const conversations = rawConversations.map((c) => ({
        id: c.id,
        createdAt: c.createdAt.getTime(),
        lastMessage: '',
        lastMessageTime: c.createdAt.getTime(),
      }));

      const token = `mock-token-${userId}-${Date.now()}`;

      res.status(200).json({
        token,
        userId,
        conversations,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
