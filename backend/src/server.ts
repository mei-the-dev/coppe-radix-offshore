import express from 'express';
import cors from 'cors';
import { mountRoutes } from './routes';

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
};

export function createApp(): express.Application {
  const app = express();
  app.use(cors(corsOptions));
  app.use(express.json());
  mountRoutes(app);
  return app;
}
