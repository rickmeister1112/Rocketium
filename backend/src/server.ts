import http from 'node:http';

import { Server } from 'socket.io';

import app from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';
import { registerDesignHub } from './realtime/designHub';
import { setSocketServer } from './realtime/socketService';
import { logger } from './utils/logger';

const server = http.createServer(app);

const allowedOrigins = env.clientUrls;
const localhostPattern = /^http:\/\/localhost:\d+$/;

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || localhostPattern.test(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  },
});

registerDesignHub(io);
setSocketServer(io);

const start = async (): Promise<void> => {
  await connectDatabase();

  server.listen(env.port, () => {
    logger.info({ port: env.port }, 'Server listening');
  });
};

start().catch((error) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});

const shutdown = async (): Promise<void> => {
  logger.info('Shutting down gracefully...');
  io.close();
  server.close();
  await disconnectDatabase();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

