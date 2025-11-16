/**
 * Configuration file for Shop Floor Management Module
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || 'file:./database/shopfloor.db',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
};

export default config;

