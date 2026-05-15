import { prisma } from '../../infrastructure/database/prisma';
import { CreateMessageDTO } from './chat.types';
import { logger } from '../../shared/logger';

const participantsInclude = {
  participants: {
    include: { user: { select: { firstName: true, lastName: true } } },
  },
} as const;

/**
 * Handles low-level chat persistence operations using Prisma.
 */
export class ChatRepository {
  /**
   * Finds a conversation by its unique identifier.
   */
  async getConversationsByUserId(userId: string) {
    logger.debug(`DB read: conversation.findMany userId=${userId}`);
    return prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: { ...participantsInclude, messages: true },
    });
  }

  async getConversationById(id: string) {
    logger.debug(`DB read: conversation.findUnique id=${id}`);
    return prisma.conversation.findUnique({
      where: { id },
    });
  }

  async getConversationWithParticipants(id: string) {
    logger.debug(`DB read: conversation.findUnique with participants id=${id}`);
    return prisma.conversation.findUnique({
      where: { id },
      include: participantsInclude,
    });
  }

  async createConversation(participantIds: string[]) {
    logger.debug(`DB write: conversation.create participantIds=${participantIds}`);

    return prisma.conversation.create({
      data: {
        participants: {
          create: participantIds.map((userId) => ({ userId })),
        },
      },
      include: participantsInclude,
    });
  }

  /**
   * Creates and persists a new message in a conversation.
   */
  async createMessage(data: CreateMessageDTO) {
    logger.debug(
      `DB write: message.create conversationId=${data.conversationId} senderId=${data.senderId}`,
    );
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
    logger.debug(
      `DB read: message.findMany conversationId=${conversationId} limit=${limit} before=${before}`,
    );
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
