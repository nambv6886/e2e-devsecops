import * as Joi from 'joi';

export const configSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_TYPE: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  JWT_SECRET_KEY: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRES_TIME: Joi.string().required(),
  JWT_REFRESH_TOKEN_EXPIRES_TIME: Joi.string().required(),
  FORGOT_PASSWORD_WAIT_TIME_IN_SECONDS: Joi.number().required(),
  PASSWORD_RESET_TOKEN_LIFE_TIME_IN_SECONDS: Joi.number().required(),
  BASE_URL: Joi.string().required(),
  EMAIL_SMTP_HOST: Joi.string().required(),
  EMAIL_SMTP_PORT: Joi.number().required(),
  EMAIL_USER_NAME: Joi.string().required(),
  EMAIL_PASSWORD: Joi.string().required(),
  EMAIL_RESET_PASSWORD_SUBJECT: Joi.string().required(),
});