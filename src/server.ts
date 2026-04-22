import http from 'http';
// import { Server } from 'socket.io';
import { WebSocketServer, WebSocket } from 'ws';
import { app } from './app';
import { logger } from './shared/logger';
import { config } from './config';

const server = http.createServer(app);

// import { registerChatSocketEvents } from './modules/chat/chat.socket';
import { registerRawChatSocketEvents } from './modules/chat/chat.raw.socket';

// Initialize Raw WebSocket Server
export const wss = new WebSocketServer({ server });
registerRawChatSocketEvents(wss);

// Initialize Socket.io
// export const io = new Server(server, {
//   cors: {
//     origin: '*', // Adjust for production
//     methods: ['GET', 'POST'],
//   },
// });

// registerChatSocketEvents(io);

const startServer = () => {
  server.listen(config.port, () => {
    logger.info(`Server is running in ${config.nodeEnv} mode on port ${config.port}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err: Error) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
