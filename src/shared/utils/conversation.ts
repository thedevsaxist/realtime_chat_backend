import { Conversation, Message } from '../models';
import { Prisma, Message as PrismaMessage } from '@prisma/client';

type ConversationWithMessages = Prisma.ConversationGetPayload<{
  include: { messages: true };
}>;

export const formatConversation = (convo: ConversationWithMessages): Conversation => ({
  id: convo.id,
  createdAt: convo.createdAt,
  messages: convo.messages.map(formatMessage),
});

export const formatMessage = (message: PrismaMessage): Message => ({
  id: message.id,
  content: message.content,
  senderId: message.senderId,
  conversationId: message.conversationId,
  createdAt: message.createdAt,
});
