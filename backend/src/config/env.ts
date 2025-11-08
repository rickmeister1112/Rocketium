import dotenv from 'dotenv';

dotenv.config();

const rawClientUrls = process.env.CLIENT_URLS ?? process.env.CLIENT_URL ?? 'http://localhost:5173';

const clientUrls = rawClientUrls
  .split(',')
  .map((url) => url.trim())
  .filter((url) => url.length > 0);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/rocketium',
  clientUrls,
};

