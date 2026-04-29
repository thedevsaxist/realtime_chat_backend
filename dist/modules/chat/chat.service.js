"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const AppError_1 = require("../../shared/errors/AppError");
class ChatService {
    chatRepository;
    constructor(chatRepository) {
        this.chatRepository = chatRepository;
    }
    async createMessage(data) {
        if (!data.conversationId) {
            throw new AppError_1.AppError("conversationId is required", 400);
        }
        const conversation = await this.chatRepository.getConversationById(data.conversationId);
        if (!conversation) {
            throw new AppError_1.AppError('Conversation not found', 404);
        }
        return this.chatRepository.createMessage(data);
    }
    async getMessages(data) {
        if (!data.conversationId) {
            throw new AppError_1.AppError("conversationId is required", 400);
        }
        const limit = data.limit && data.limit > 0 ? Number(data.limit) : 20;
        const conversation = await this.chatRepository.getConversationById(data.conversationId);
        if (!conversation) {
            throw new AppError_1.AppError('Conversation not found', 404);
        }
        return this.chatRepository.getMessages(data.conversationId, limit, data.before);
    }
}
exports.ChatService = ChatService;
