export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export const REDIS_CLIENT = 'REDIS_CLIENT';
export const REDIS_KEY_FORGOT_PASSWORD = 'FORGOT_PASSWORD';
export const CIPHER_KEY = 'CIPHER_KEY';

export enum TokenType {
  RESET_PASSWORD_TOKEN = 'RESET_PASSWORD_TOKEN',
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}