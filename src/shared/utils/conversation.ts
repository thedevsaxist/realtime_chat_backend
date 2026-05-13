import { Conversation, Message } from '../models';
import { Prisma, Message as PrismaMessage, ConversationParticipant as PrismaParticipant } from '@prisma/client';

type ConversationWithDetails = Prisma.ConversationGetPayload<{
  include: { messages: true; participants: true };
}>;

export const formatConversation = (convo: ConversationWithDetails): Conversation => ({
  id: convo.id,
  createdAt: convo.createdAt,
  messages: convo.messages.map(formatMessage),
  participants: convo.participants.map((p: PrismaParticipant) => ({
    id: p.id,
    userId: p.userId,
    conversationId: p.conversationId,
  })),
});

export const formatMessage = (message: PrismaMessage): Message => ({
  id: message.id,
  content: message.content,
  senderId: message.senderId,
  conversationId: message.conversationId,
  createdAt: message.createdAt,
});
