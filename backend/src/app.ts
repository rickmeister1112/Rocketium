import compression from 'compression';
import cors, { type CorsOptions } from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';
import routes from './routes';
import { logger } from './utils/logger';

const app = express();

app.disable('x-powered-by');
app.set('etag', false);

app.use(helmet());
app.use(
  pinoHttp({
    logger: logger as unknown as any,
    customSuccessMessage: () => 'request completed',
    customErrorMessage: (_req, _res, error) => `request errored: ${error.message}`,
  }),
);
app.use(compression());

if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

const allowedOrigins = env.clientUrls;
const localhostPattern = /^http:\/\/localhost:\d+$/;

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin) || localhostPattern.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use((_req, res, next) => {
  res.set({
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
    Expires: '0',
  });
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

