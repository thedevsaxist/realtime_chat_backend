import { ChatRepository } from './chat.repository';
import { CreateMessageDTO, GetMessagesDTO } from './chat.types';
import { AppError } from '../../shared/errors/AppError';

export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async createMessage(data: CreateMessageDTO) {
    if (!data.conversationId) {
      throw new AppError("conversationId is required", 400);
    }

    const conversation = await this.chatRepository.getConversationById(data.conversationId);
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    return this.chatRepository.createMessage(data);
  }

  async getMessages(data: GetMessagesDTO) {
    if (!data.conversationId) {
      throw new AppError("conversationId is required", 400);
    }
    const limit = data.limit && data.limit > 0 ? Number(data.limit) : 20;

    const conversation = await this.chatRepository.getConversationById(data.conversationId);
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    return this.chatRepository.getMessages(data.conversationId, limit, data.before);
  }
}
