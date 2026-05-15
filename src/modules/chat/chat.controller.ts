import { Request, Response, NextFunction } from 'express';
import { ChatService } from './chat.service';
import { GetMessagesDTO, CreateConversationDTO } from './chat.types';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import { logger } from '../../shared/logger';

export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      logger.debug(`getConversations: userId=${userId}`);
      const conversations = await this.chatService.getConversations(userId);

      logger.info(
        `getConversations: returned ${conversations.length} conversations for userId=${userId}`,
      );
      res.status(200).json({ conversations });
    } catch (error) {
      next(error);
    }
  };

  createConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateConversationDTO = req.body;
      logger.debug(`createConversation: participantIds=${data.participantIds}`);

      const conversation = await this.chatService.createConversation(data);
      logger.info(`createConversation: created conversationId=${conversation.id}`);

      res.status(201).json({ conversation });
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { conversationId, before, limit } = req.query as any;
      logger.debug(`getMessages: conversationId=${conversationId} limit=${limit} before=${before}`);

      if (conversationId == null) {
        return res.status(400).json({ message: 'Conversation Id is required' });
      }

      const query: GetMessagesDTO = {
        conversationId,
        before,
        limit: limit ? parseInt(limit, 10) : undefined,
      };

      const messages = await this.chatService.getMessages(query);
      logger.info(
        `getMessages: returned ${messages.length} messages for conversationId=${conversationId}`,
      );
      res.status(200).json({
        messages,
      });
    } catch (error) {
      next(error);
    }
  };
}
