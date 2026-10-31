import type { User } from './types';
import { ADMIN_USER_ID } from './adminIdentity';

export const isAdminUser = (user: Pick<User, 'id'> | null | undefined): boolean => {
  if (!user) {
    return false;
  }

  return user.id === ADMIN_USER_ID;
};

export const resolvePostSignInRoute = (options: {
  user?: Pick<User, 'id' | 'email'> | null;
}): string => {
  const { user } = options;

  if (user && isAdminUser(user)) {
    return '/studio';
  }

  return '/';
};
