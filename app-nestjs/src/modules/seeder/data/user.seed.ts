import { HashUtils } from '../../../common/utils/hash.utils';
import { UserRole } from '../../../common/constants/common';

/**
 * Seed data for users
 * Contains sample admin and regular users for testing
 *
 * Default password for all users: "password123"
 */

// Generate consistent salt and password for seed users
const generateUserCredentials = (password: string) => {
  const salt = HashUtils.genRandomString(20);
  const hashedPassword = HashUtils.hashPassword(password, salt);
  return { salt, hashedPassword };
};

// Default password for all seed users
const DEFAULT_PASSWORD = 'password123';
const adminCreds = generateUserCredentials(DEFAULT_PASSWORD);
const userCreds = generateUserCredentials(DEFAULT_PASSWORD);

export const seedUsers = [
  // Admin user
  {
    email: 'admin@example.com',
    password: adminCreds.hashedPassword,
    salt: adminCreds.salt,
    role: UserRole.ADMIN,
    isActive: true,
  },
  // Regular users
  {
    email: 'user1@example.com',
    password: userCreds.hashedPassword,
    salt: userCreds.salt,
    role: UserRole.USER,
    isActive: true,
  },
  {
    email: 'user2@example.com',
    password: userCreds.hashedPassword,
    salt: userCreds.salt,
    role: UserRole.USER,
    isActive: true,
  },
  {
    email: 'john.doe@example.com',
    password: userCreds.hashedPassword,
    salt: userCreds.salt,
    role: UserRole.USER,
    isActive: true,
  },
  {
    email: 'jane.smith@example.com',
    password: userCreds.hashedPassword,
    salt: userCreds.salt,
    role: UserRole.USER,
    isActive: true,
  },
];
