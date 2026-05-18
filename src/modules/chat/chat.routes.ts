import { Router } from 'express';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';

export const chatRoutes = Router();

// Dependency Injection setup for the chat module
const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);
const chatController = new ChatController(chatService);

chatRoutes.get('/messages', chatController.getMessages);
chatRoutes.get('/conversations', chatController.getConversations);
chatRoutes.patch('/conversations/:conversationId/read/:lastMessageId', chatController.markAsRead);
chatRoutes.post('/conversations', chatController.createConversation);
chatRoutes.get('/conversations/unread', chatController.getUnreadCount);

// chatRoutes.post('/messages', chatController.sendMessage);
