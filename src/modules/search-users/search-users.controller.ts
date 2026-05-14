import { logger } from '../../shared/logger';
import { Request, Response } from 'express';
import { User } from '../../shared/models';
import { SearchUserService } from './search-users.service';

const searchUserService = new SearchUserService();

class SearchUsersController {
  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId as string;

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
