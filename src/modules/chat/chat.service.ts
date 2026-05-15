import { AppError } from '../../shared/errors/AppError';
import { CreateMessageDTO, GetMessagesDTO, CreateConversationDTO } from './chat.types';
import { notifyUser } from '../../shared/utils/chat.socket.registry';
import { ChatRepository } from './chat.repository';
import { logger } from '../../shared/logger';
import { formatConversation } from '../../shared/utils/conversation';

/**
 * Handles chat business logic and validation before data persistence.
 */
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  /**
   * Creates a chat message after validating that the target conversation exists.
   *
   * @param data Message payload containing conversation and sender details.
   * @throws {AppError} When conversationId is missing (400) or conversation does not exist (404).
   * @returns Newly created message entity from the repository.
   */
  async getConversations(userId: string) {
    logger.debug(`ChatService.getConversations: userId=${userId}`);
    const raw = await this.chatRepository.getConversationsByUserId(userId);
    return raw.map((c) => formatConversation(c));
  }

  async createConversation(data: CreateConversationDTO) {
    if (!data.participantIds || data.participantIds.length < 2) {
      throw new AppError('At least 2 participantIds are required', 400);
    }

    logger.debug(`ChatService.createConversation: participantIds=${data.participantIds}`);

    const raw = await this.chatRepository.createConversation(data.participantIds);
    const conversation = formatConversation(raw);
    logger.info(`ChatService.createConversation: conversationId=${conversation.id} created`);

    for (const userId of data.participantIds) {
      notifyUser(userId, 'new_conversation', conversation);
    }
    return conversation;
  }

  async createMessage(data: CreateMessageDTO) {
    if (!data.conversationId) {
      throw new AppError('conversationId is required', 400);
    }
    logger.debug(
      `ChatService.createMessage: conversationId=${data.conversationId} senderId=${data.senderId}`,
    );
    const conversation = await this.chatRepository.getConversationWithParticipants(
      data.conversationId,
    );
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }
    const message = await this.chatRepository.createMessage(data);
    logger.info(`ChatService.createMessage: messageId=${message.id} created`);
    for (const { userId } of conversation.participants) {
      notifyUser(userId, 'message', message);
    }
    return message;
  }

  /**
   * Retrieves conversation messages with simple cursor-based pagination.
   * Defaults to 20 items when an invalid or missing limit is provided.
   *
   * @param data Query data containing conversationId and optional pagination values.
   * @throws {AppError} When conversationId is missing (400) or conversation does not exist (404).
   * @returns A list of messages ordered by newest first.
   */
  async getMessages(data: GetMessagesDTO) {
    if (!data.conversationId) {
      throw new AppError('conversationId is required', 400);
    }
    const limit = data.limit && data.limit > 0 ? Number(data.limit) : 20;
    logger.debug(
      `ChatService.getMessages: conversationId=${data.conversationId} limit=${limit} before=${data.before}`,
    );
    const conversation = await this.chatRepository.getConversationById(data.conversationId);
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }
    return this.chatRepository.getMessages(data.conversationId, limit, data.before);
  }
}
