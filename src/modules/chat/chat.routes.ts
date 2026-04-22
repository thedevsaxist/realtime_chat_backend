import { Router } from 'express';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';

export const chatRoutes = Router();

// Dependency Injection setup for the chat module
const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);
const chatController = new ChatController(chatService);

chatRoutes.post('/', chatController.sendMessage);
chatRoutes.get('/', chatController.getMessages);
