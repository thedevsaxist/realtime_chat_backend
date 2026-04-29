"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = void 0;
const express_1 = require("express");
const chat_controller_1 = require("./chat.controller");
const chat_service_1 = require("./chat.service");
const chat_repository_1 = require("./chat.repository");
exports.chatRoutes = (0, express_1.Router)();
// Dependency Injection setup for the chat module
const chatRepository = new chat_repository_1.ChatRepository();
const chatService = new chat_service_1.ChatService(chatRepository);
const chatController = new chat_controller_1.ChatController(chatService);
exports.chatRoutes.post('/', chatController.sendMessage);
exports.chatRoutes.get('/', chatController.getMessages);
