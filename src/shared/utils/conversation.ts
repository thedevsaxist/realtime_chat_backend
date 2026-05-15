import { Conversation, Message } from '../models';
import { Prisma, Message as PrismaMessage } from '@prisma/client';

type ParticipantWithUser = Prisma.ConversationParticipantGetPayload<{
  include: { user: { select: { firstName: true; lastName: true } } };
}>;

type ConversationWithDetails = {
  id: string;
  createdAt: Date;
  messages?: PrismaMessage[];
  participants: ParticipantWithUser[];
};

export const formatConversation = (convo: ConversationWithDetails, includeMessages = false): Conversation => ({
  id: convo.id,
  createdAt: convo.createdAt,
  ...(includeMessages && { messages: convo.messages?.map(formatMessage) }),
  participants: convo.participants.map((p: ParticipantWithUser) => ({
    userId: p.userId,
    firstName: p.user.firstName,
    lastName: p.user.lastName,
  })),
});

export const formatMessage = (message: PrismaMessage): Message => ({
  id: message.id,
  content: message.content,
  senderId: message.senderId,
  conversationId: message.conversationId,
  createdAt: message.createdAt,
});
