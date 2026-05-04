"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./shared/middleware/errorHandler");
exports.app = (0, express_1.default)();
// Middleware
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
const chat_routes_1 = require("./modules/chat/chat.routes");
const health_routes_1 = require("./modules/health/health.routes");
const auth_routes_1 = require("./modules/auth/auth.routes");
const auth_middleware_1 = require("./shared/middleware/auth.middleware");
// Routes
exports.app.use('/health', health_routes_1.healthRoutes);
exports.app.use('/auth', auth_routes_1.authRoutes);
// Apply auth middleware for all protected routes below this line
exports.app.use(auth_middleware_1.authMiddleware);
exports.app.use('/messages', chat_routes_1.chatRoutes);
// Global Error Handler
exports.app.use(errorHandler_1.errorHandler);
