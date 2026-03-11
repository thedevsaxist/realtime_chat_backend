import { prisma } from '../../infrastructure/database/prisma';
import { CreateMessageDTO } from './chat.types';

export class ChatRepository {
  async getConversationById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
    });
  }

  async createMessage(data: CreateMessageDTO) {
    return prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
      },
    });
  }

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
