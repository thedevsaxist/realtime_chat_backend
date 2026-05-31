import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { URL } from 'url';
import jwt from 'jsonwebtoken';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';
import { logger } from '../../shared/logger';
import { registerUserSocket, removeUserSocket } from '../../shared/utils/chat.socket.registry';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

function getUserIdFromRequest(req: IncomingMessage): string | null {
  try {
    const url = new URL(req.url!, `http://localhost`);
    const token = url.searchParams.get('token');
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    logger.info(`websocketAuthWMiddleware: Successful authentication with id = ${decoded.userId}}`);
    return decoded.userId;
  } catch {
    logger.warn(`websocketAuthWMiddleware: invalid or expired token on Websocket connection`);
    return null;
  }
}

const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);

/**
 * Registers raw WebSocket handlers.
 * Each authenticated user connects once on app start; the server routes all
 * messages for that user down this single socket.
 *
 * Supported incoming events:
 * - send_message: data => { conversationId, senderId, content }
 *
 * Outgoing events:
 * - message_created: { conversationId, ...message } delivered to every participant's user socket
 * - error: sent when payload parsing or processing fails
 */
export const registerRawChatSocketEvents = (wss: WebSocketServer) => {
  wss.on('connection', (socket: WebSocket, req: IncomingMessage) => {
    const userId = getUserIdFromRequest(req);

    if (!userId || userId === null) {
      socket.send(JSON.stringify({ type: 'error', statusCode: 401, message: 'Invalid Token' }));
      socket.close(4001, 'Unauthorized');
      return;
    }
    
    registerUserSocket(userId, socket);
    logger.info(`Client connected: userId=${userId}`);

    socket.on('message', async (rawData) => {
      try {
        const { event, data } = JSON.parse(rawData.toString());

        if (event === 'send_message') {
          const { conversationId, senderId, content, tempId } = data;
          await chatService.createMessage({ conversationId, senderId, content, tempId });

          logger.info(`Message sent in conversation ${conversationId} by userId=${userId}`);
        }
      } catch (error) {
        logger.error(`Failed to process raw socket message: ${error}`);

        socket.send(
          JSON.stringify({ event: 'error', data: { message: 'Failed to process message' } }),
        );
      }
    });

    socket.on('close', () => {
      removeUserSocket(userId);
      logger.info(`Client disconnected: userId=${userId}`);
    });
  });
};
