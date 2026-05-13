import { prisma } from '../../infrastructure/database/prisma';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../shared/logger';

class SearchUserService {
  async searchUser(userId: string) {
    if (!userId) {
      throw new AppError('User Id is required', 400);
    }
    logger.debug(`DB read: user.findMany excluding userId=${userId}`);
    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });
    logger.info(`DB read: user.findMany returned ${users.length} users`);
    return users;
  }
}

export { SearchUserService };
