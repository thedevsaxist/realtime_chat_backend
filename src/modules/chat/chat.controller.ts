import { Request, Response, NextFunction } from 'express';
import { ChatService } from './chat.service';
import { CreateMessageDTO, GetMessagesDTO } from './chat.types';

export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateMessageDTO = req.body;
      const message = await this.chatService.createMessage(data);

      res.status(201).json({
        status: 'success',
        data: { message },
      });
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { conversationId, before, limit } = req.query as any;

      const query: GetMessagesDTO = {
        conversationId,
        before,
        limit: limit ? parseInt(limit, 10) : undefined,
      };

      const messages = await this.chatService.getMessages(query);

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
