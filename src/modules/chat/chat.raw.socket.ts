import { WebSocket, WebSocketServer } from 'ws';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';
import { logger } from '../../shared/logger';

// Setup dependencies for WebSocket (similarly to router)
const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);

// In-memory room registry for raw WebSocket connections.
// Key: conversationId, Value: set of connected sockets in that conversation.
const rooms = new Map<string, Set<WebSocket>>();

/**
 * Registers raw WebSocket chat event handlers.
 *
 * Supported incoming events:
 * - join_conversation: data => conversationId (string)
 * - leave_conversation: data => conversationId (string)
 * - send_message: data => { conversationId, senderId, content }
 *
 * Outgoing events:
 * - message_created: broadcast to all sockets in the conversation room
 * - error: sent when payload parsing or processing fails
 */
export const registerRawChatSocketEvents = (wss: WebSocketServer) => {
  wss.on('connection', (socket: WebSocket) => {
    logger.info('Client connected to raw websocket');

    socket.on('message', async (rawData) => {
      try {
        const parsedData = JSON.parse(rawData.toString());
        const { event, data } = parsedData;

        if (event === 'join_conversation') {
          // Add the socket to the target conversation room.
          const conversationId = data as string;
          if (!rooms.has(conversationId)) {
            rooms.set(conversationId, new Set());
          }
          rooms.get(conversationId)?.add(socket);
          logger.info(`Raw Socket joined conversation ${conversationId}`);
        } 
        else if (event === 'leave_conversation') {
          // Remove the socket from the target conversation room.
          const conversationId = data as string;
          rooms.get(conversationId)?.delete(socket);
          if (rooms.get(conversationId)?.size === 0) {
            rooms.delete(conversationId);
          }
          logger.info(`Raw Socket left conversation ${conversationId}`);
        } 
        else if (event === 'send_message') {
          const { conversationId, senderId, content } = data;
          
          // Persist message in the database before broadcasting.
          const message = await chatService.createMessage({ conversationId, senderId, content });

          // Broadcast to all clients in the conversation, including the sender
          const roomClients = rooms.get(conversationId);
          if (roomClients) {
            const broadcastPayload = JSON.stringify({
              event: 'message_created',
              data: message
            });
            for (const client of roomClients) {
               if (client.readyState === WebSocket.OPEN) {
                  client.send(broadcastPayload);
               }
            }
          }
          logger.info(`Message broadcasted to conversation ${conversationId} via raw socket`);
        }
      } catch (error) {
        logger.error(`Failed to process raw socket message: ${error}`);
        // Keep a consistent error event shape for clients.
        socket.send(JSON.stringify({ event: 'error', data: { message: 'Failed to process message' } }));
      }
    });

    socket.on('close', () => {
      logger.info('Client disconnected from raw websocket');
      // Remove socket from all rooms to avoid stale connections.
      for (const [roomId, clients] of rooms.entries()) {
        if (clients.has(socket)) {
          clients.delete(socket);
          if (clients.size === 0) {
            rooms.delete(roomId);
          }
        }
      }
    });
  });
};