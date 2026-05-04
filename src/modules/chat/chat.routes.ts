import { Router } from 'express';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';

export const chatRoutes = Router();

// Dependency Injection setup for the chat module
const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);
const chatController = new ChatController(chatService);

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a new message
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - senderId
 *               - content
 *             properties:
 *               conversationId:
 *                 type: string
 *               senderId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid payload
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
chatRoutes.post('/', chatController.sendMessage);

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Get messages for a conversation
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: before
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 20
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       400:
 *         description: Missing conversationId
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
chatRoutes.get('/', chatController.getMessages);
