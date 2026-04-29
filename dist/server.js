"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = void 0;
const http_1 = __importDefault(require("http"));
// import { Server } from 'socket.io';
const ws_1 = require("ws");
const app_1 = require("./app");
const logger_1 = require("./shared/logger");
const config_1 = require("./config");
const server = http_1.default.createServer(app_1.app);
// import { registerChatSocketEvents } from './modules/chat/chat.socket';
const chat_raw_socket_1 = require("./modules/chat/chat.raw.socket");
// Initialize Raw WebSocket Server
exports.wss = new ws_1.WebSocketServer({ server });
(0, chat_raw_socket_1.registerRawChatSocketEvents)(exports.wss);
// Initialize Socket.io
// export const io = new Server(server, {
//   cors: {
//     origin: '*', // Adjust for production
//     methods: ['GET', 'POST'],
//   },
// });
// registerChatSocketEvents(io);
const startServer = () => {
    server.listen(config_1.config.port, () => {
        logger_1.logger.info(`Server is running in ${config_1.config.nodeEnv} mode on port ${config_1.config.port}`);
    });
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        logger_1.logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
        server.close(() => {
            process.exit(1);
        });
    });
};
startServer();
