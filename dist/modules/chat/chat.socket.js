"use strict";
// import { Server, Socket } from 'socket.io';
// import { ChatService } from './chat.service';
// import { ChatRepository } from './chat.repository';
// import { logger } from '../../shared/logger';
// // Setup dependencies for WebSocket (similarly to router)
// const chatRepository = new ChatRepository();
// const chatService = new ChatService(chatRepository);
// export const registerChatSocketEvents = (io: Server) => {
//   io.on('connection', (socket: Socket) => {
//     logger.info(`Client connected: ${socket.id}`);
//     // Join a conversation room
//     socket.on('join_conversation', (conversationId: string) => {
//       socket.join(conversationId);
//       logger.info(`Socket ${socket.id} joined conversation ${conversationId}`);
//     });
//     // Leave a conversation room
//     socket.on('leave_conversation', (conversationId: string) => {
//       socket.leave(conversationId);
//       logger.info(`Socket ${socket.id} left conversation ${conversationId}`);
//     });
//     // Handle incoming messages
//     socket.on('send_message', async (data: { conversationId: string; senderId: string; content: string }) => {
//       try {
//         // Persist message in database
//         const message = await chatService.createMessage(data);
//         // Broadcast to all clients in the conversation, including the sender
//         io.to(data.conversationId).emit('message_created', message);
//         logger.info(`Message broadcasted to conversation ${data.conversationId}`);
//       } catch (error) {
//         logger.error(`Failed to send message over socket: ${error}`);
//         socket.emit('error', { message: 'Failed to process message' });
//       }
//     });
//     socket.on('disconnect', () => {
//       logger.info(`Client disconnected: ${socket.id}`);
//     });
//   });
// };
