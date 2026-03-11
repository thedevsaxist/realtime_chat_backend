import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a conversation
  const conversation = await prisma.conversation.create({
    data: {},
  });
  console.log(`Created conversation with ID: ${conversation.id}`);

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

  console.log(`Created ${messageCount} messages in conversation ${conversation.id}`);
  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
