import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  DEFAULT_PER_PAGE: 10,
  DEFAULT_PAGE_NO: 1,
  PORT: Number(process.env.PORT) || 3000,
  APP_URL: process.env.APP_URL || 'http://localhost:',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_PORT: Number(process.env.DB_PORT),
  DB_DATABASE: process.env.DB_DATABASE,
  DB_HOST: process.env.DB_HOST,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_USERNAME: process.env.DB_USERNAME,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY,
  GMAIL_USER: process.env.GMAIL_USER || '',
  GMAIL_PASSWORD: process.env.GMAIL_PASSWORD || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
};
