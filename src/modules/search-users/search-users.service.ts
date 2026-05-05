import { prisma } from '../../infrastructure/database/prisma';
import { AppError } from '../../shared/errors/AppError';

class SearchUserService {
  async searchUser(userId: string) {
    if (!userId) {
      throw new AppError('User Id is required', 400);
    }

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

    return users;
  }
}

export { SearchUserService };
