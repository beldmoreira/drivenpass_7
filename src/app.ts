import 'express-async-errors';
import express, { Express } from 'express';
import cors from 'cors';
import { loadEnv } from './config/envs';
import { connectDb, disconnectDB } from '@/config';

loadEnv();

import { handleApplicationErrors } from '@/middlewares';
import { credentialsRouter, networksRouter, usersRouter } from '@/routers';

const app = express();
app
  .use(cors())
  .use(express.json())
  .use('/users', usersRouter)
  .use('/credentials', credentialsRouter)
  .use('/networks', networksRouter)
  .use(handleApplicationErrors);

export function init(): Promise<Express> {
  connectDb();
  return Promise.resolve(app);
}

export async function close(): Promise<void> {
  await disconnectDB();
}

export default app;
