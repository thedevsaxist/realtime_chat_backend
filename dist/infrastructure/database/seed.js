"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const logger_1 = require("../../shared/logger");
const prisma = new client_1.PrismaClient();
async function main() {
    logger_1.logger.info('Seeding database...');
    // Create a conversation
    const conversation = await prisma.conversation.create({
        data: {},
    });
    logger_1.logger.info(`Created conversation with ID: ${conversation.id}`);
    // Create some initial messages
    await prisma.message.createMany({
        data: [
            {
                conversationId: conversation.id,
                senderId: 'user-1',
                content: 'Hello! Welcome to the minimal realtime chat.',
            },
            {
                conversationId: conversation.id,
                senderId: 'user-2',
                content: 'Thanks! Let\'s test the WebSockets now.',
            },
        ],
    });
    const messageCount = await prisma.message.count({
        where: { conversationId: conversation.id },
    });
    logger_1.logger.info(`Created ${messageCount} messages in conversation ${conversation.id}`);
    logger_1.logger.info('Database seeding completed.');
}
main()
    .catch((e) => {
    logger_1.logger.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
