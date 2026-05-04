import { ChatRepository } from './chat.repository';
import { CreateMessageDTO, GetMessagesDTO } from './chat.types';
import { AppError } from '../../shared/errors/AppError';

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
