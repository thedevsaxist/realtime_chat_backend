import { Request, Response, NextFunction } from 'express';
import { ChatService } from './chat.service';
import { CreateMessageDTO, GetMessagesDTO, CreateConversationDTO } from './chat.types';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import { logger } from '../../shared/logger';

export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * @swagger
   * /messages:
   *   post:
   *     summary: Send a message to a conversation
   *     tags: [Chat]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateMessageDTO'
   *     responses:
   *       201:
   *         description: Message sent successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   type: object
   *                   properties:
   *                     message:
   *                       $ref: '#/components/schemas/ChatMessage'
   *       400:
   *         description: conversationId is required
   *       404:
   *         description: Conversation not found
   *       500:
   *         description: Internal server error
   */
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
      res.status(200).json({ status: 'success', conversations });
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
      res.status(201).json({ status: 'success', conversation });
    } catch (error) {
      next(error);
    }
  };

  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateMessageDTO = req.body;
      logger.debug(`sendMessage: conversationId=${data.conversationId} senderId=${data.senderId}`);
      const message = await this.chatService.createMessage(data);
      logger.info(
        `sendMessage: created messageId=${message.id} in conversationId=${data.conversationId}`,
      );
      res.status(201).json({
        status: 'success',
        data: { message },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /messages:
   *   get:
   *     summary: Get paginated messages for a conversation
   *     tags: [Chat]
   *     parameters:
   *       - in: query
   *         name: conversationId
   *         required: true
   *         schema:
   *           type: string
   *         example: clxconversation123
   *       - in: query
   *         name: before
   *         required: false
   *         schema:
   *           type: string
   *           format: date-time
   *         example: 2026-05-01T15:00:00.000Z
   *       - in: query
   *         name: limit
   *         required: false
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 20
   *         example: 20
   *     responses:
   *       200:
   *         description: Messages fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 results:
   *                   type: integer
   *                   example: 2
   *                 data:
   *                   type: object
   *                   properties:
   *                     messages:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/ChatMessage'
   *       400:
   *         description: conversationId is required
   *       404:
   *         description: Conversation not found
   *       500:
   *         description: Internal server error
   */
  getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { conversationId, before, limit } = req.query as any;
      logger.debug(`getMessages: conversationId=${conversationId} limit=${limit} before=${before}`);
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
        status: 'success',
        results: messages.length,
        data: { messages },
      });
    } catch (error) {
      next(error);
    }
  };
}
