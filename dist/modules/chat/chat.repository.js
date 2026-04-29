"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRepository = void 0;
const prisma_1 = require("../../infrastructure/database/prisma");
class ChatRepository {
    async getConversationById(id) {
        return prisma_1.prisma.conversation.findUnique({
            where: { id },
        });
    }
    async createMessage(data) {
        return prisma_1.prisma.message.create({
            data: {
                conversationId: data.conversationId,
                senderId: data.senderId,
                content: data.content,
            },
        });
    }
    async getMessages(conversationId, limit, before) {
        const query = {
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        };
        if (before) {
            query.cursor = { id: before };
            query.skip = 1; // Skip the cursor itself
        }
        return prisma_1.prisma.message.findMany(query);
    }
}
exports.ChatRepository = ChatRepository;
