"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRawChatSocketEvents = void 0;
const ws_1 = require("ws");
const chat_service_1 = require("./chat.service");
const chat_repository_1 = require("./chat.repository");
const logger_1 = require("../../shared/logger");
// Setup dependencies for WebSocket (similarly to router)
const chatRepository = new chat_repository_1.ChatRepository();
const chatService = new chat_service_1.ChatService(chatRepository);
// To manage rooms for raw websockets
const rooms = new Map();
const registerRawChatSocketEvents = (wss) => {
    wss.on('connection', (socket) => {
        logger_1.logger.info('Client connected to raw websocket');
        socket.on('message', async (rawData) => {
            try {
                const parsedData = JSON.parse(rawData.toString());
                const { event, data } = parsedData;
                if (event === 'join_conversation') {
                    const conversationId = data;
                    if (!rooms.has(conversationId)) {
                        rooms.set(conversationId, new Set());
                    }
                    rooms.get(conversationId)?.add(socket);
                    logger_1.logger.info(`Raw Socket joined conversation ${conversationId}`);
                }
                else if (event === 'leave_conversation') {
                    const conversationId = data;
                    rooms.get(conversationId)?.delete(socket);
                    if (rooms.get(conversationId)?.size === 0) {
                        rooms.delete(conversationId);
                    }
                    logger_1.logger.info(`Raw Socket left conversation ${conversationId}`);
                }
                else if (event === 'send_message') {
                    const { conversationId, senderId, content } = data;
                    // Persist message in database
                    const message = await chatService.createMessage({ conversationId, senderId, content });
                    // Broadcast to all clients in the conversation, including the sender
                    const roomClients = rooms.get(conversationId);
                    if (roomClients) {
                        const broadcastPayload = JSON.stringify({
                            event: 'message_created',
                            data: message
                        });
                        for (const client of roomClients) {
                            if (client.readyState === ws_1.WebSocket.OPEN) {
                                client.send(broadcastPayload);
                            }
                        }
                    }
                    logger_1.logger.info(`Message broadcasted to conversation ${conversationId} via raw socket`);
                }
            }
            catch (error) {
                logger_1.logger.error(`Failed to process raw socket message: ${error}`);
                socket.send(JSON.stringify({ event: 'error', data: { message: 'Failed to process message' } }));
            }
        });
        socket.on('close', () => {
            logger_1.logger.info('Client disconnected from raw websocket');
            // Cleanup rooms
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
exports.registerRawChatSocketEvents = registerRawChatSocketEvents;
