import { logger } from '../../shared/logger';
import { Response } from 'express';

import { SearchUserService } from './search-users.service';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

const searchUserService = new SearchUserService();

class SearchUsersController {
  async searchUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId as string;

      const users = await searchUserService.searchUser(userId);

      if (users.length === 0) {
        res.status(404).json({ message: 'No users found' });
        return;
      }

      // const filteredUsers = users.filter((u) => u.id !== user.id);
      res.status(200).json({ users: users });
      logger.info(`${users.length} users found successful `);
    } catch (error) {
      logger.error('Search users error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export { SearchUsersController };
