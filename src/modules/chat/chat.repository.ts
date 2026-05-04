import { prisma } from '../../infrastructure/database/prisma';
import { CreateMessageDTO } from './chat.types';

/**
 * Handles low-level chat persistence operations using Prisma.
 */
export class ChatRepository {
  /**
   * Finds a conversation by its unique identifier.
   */
  async getConversationById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
    });
  }

  /**
   * Creates and persists a new message in a conversation.
   */
  async createMessage(data: CreateMessageDTO) {
    return prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
      },
    });
  }

  /**
   * Returns conversation messages in reverse chronological order.
   * Uses cursor pagination when `before` is provided.
   */
  async getMessages(conversationId: string, limit: number, before?: string) {
    const query: any = {
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    };

    if (before) {
      query.cursor = { id: before };
      query.skip = 1; // Skip the cursor itself
    }

    return prisma.message.findMany(query);
  }
}
