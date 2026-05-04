import { User } from '../models';
import { User as PrismaUser } from '@prisma/client';

export const formatUser = (user: PrismaUser): User => ({
  email: user.email,
  createdAt: user.createdAt,
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
});
