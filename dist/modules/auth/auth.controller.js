"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const prisma_1 = require("../../infrastructure/database/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../../shared/logger");
const models_1 = require("../../shared/models");
const user_1 = require("../../shared/utils/user");
const conversation_1 = require("../../shared/utils/conversation");
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';
const JWT_EXPIRES_IN = '24h';
class AuthController {
    async register(req, res) {
        try {
            const validation = models_1.RegisterSchema.safeParse(req.body);
            if (!validation.success) {
                logger_1.logger.warn('Register failed: Invalid credentials');
                res.status(400).json({ message: 'Invalid credentials' });
                return;
            }
            const { email, password, firstName, lastName } = validation.data;
            if (!email || !password || !firstName || !lastName) {
                res.status(400).json({ message: 'All fields are required' });
                return;
            }
            const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                res.status(409).json({ message: 'Email already exists' });
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const user = await prisma_1.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                },
            });
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
                expiresIn: JWT_EXPIRES_IN,
            });
            res.status(201).json({
                token,
                user: (0, user_1.formatUser)(user),
            });
        }
        catch (error) {
            logger_1.logger.error('Register error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async login(req, res) {
        try {
            const validation = models_1.LoginSchema.safeParse(req.body);
            if (!validation.success) {
                logger_1.logger.warn('Login failed: Invalid credentials');
                res.status(400).json({ message: 'Invalid credentials' });
                return;
            }
            const { email, password } = validation.data;
            const user = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (!user) {
                logger_1.logger.warn(`Login failed: Invalid credentials for email ${email}`);
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                logger_1.logger.warn(`Login failed: Invalid credentials for email ${email}`);
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }
            const rawConversations = await prisma_1.prisma.conversation.findMany({
                include: { messages: true },
            });
            const conversations = rawConversations.map(conversation_1.formatConversation);
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
                expiresIn: JWT_EXPIRES_IN,
            });
            res.status(200).json({
                user: (0, user_1.formatUser)(user),
                token,
                conversations,
            });
            logger_1.logger.info(`Login successful for user ${user.id} (${email})`);
        }
        catch (error) {
            logger_1.logger.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
exports.AuthController = AuthController;
