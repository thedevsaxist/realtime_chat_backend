import { Router } from 'express';
import { SearchUsersController } from './search-users.controller';

export const searchUsersRoutes = Router();

const searchUsersController = new SearchUsersController();

searchUsersRoutes.get('/', searchUsersController.searchUsers);
