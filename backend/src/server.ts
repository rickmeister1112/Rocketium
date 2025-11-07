import http from 'node:http';

import { Server } from 'socket.io';

import app from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';
import { registerDesignHub } from './realtime/designHub';
import { setSocketServer } from './realtime/socketService';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.clientUrl,
    credentials: true,
  },
});

registerDesignHub(io);
setSocketServer(io);

const start = async (): Promise<void> => {
  await connectDatabase();

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`⚡️ Server running on http://localhost:${env.port}`);
  });
};

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', error);
  process.exit(1);
});

const shutdown = async (): Promise<void> => {
  // eslint-disable-next-line no-console
  console.log('Shutting down gracefully...');
  io.close();
  server.close();
  await disconnectDatabase();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

