"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    sendMessage = async (req, res, next) => {
        try {
            const data = req.body;
            const message = await this.chatService.createMessage(data);
            res.status(201).json({
                status: 'success',
                data: { message },
            });
        }
        catch (error) {
            next(error);
        }
    };
    getMessages = async (req, res, next) => {
        try {
            const { conversationId, before, limit } = req.query;
            const query = {
                conversationId,
                before,
                limit: limit ? parseInt(limit, 10) : undefined,
            };
            const messages = await this.chatService.getMessages(query);
            res.status(200).json({
                status: 'success',
                results: messages.length,
                data: { messages },
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ChatController = ChatController;
