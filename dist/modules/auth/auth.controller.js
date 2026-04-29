"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const prisma_1 = require("../../infrastructure/database/prisma");
class AuthController {
    async login(req, res) {
        try {
            const { userId, password } = req.body;
            // Hardcoded default credentials for two users
            const validUsers = {
                'user-1': 'pass1',
                'user-2': 'pass2',
            };
            if (!userId || !password || validUsers[userId] !== password) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }
            // Fetch all available conversations
            // Currently assuming all connected users have access to the seeded conversation
            const conversations = await prisma_1.prisma.conversation.findMany();
            const conversationIds = conversations.map((c) => c.id);
            const token = `mock-token-${userId}-${Date.now()}`;
            res.status(200).json({
                token,
                userId,
                conversationIds,
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
exports.AuthController = AuthController;
