import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/errorHandler.middleware';
import authRoutes from './routes/auth.routes';
import boardRoutes from './routes/boards.routes';
import listRoutes from './routes/lists.routes';
import cardRoutes from './routes/cards.routes';

export const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);

app.use(notFound);
app.use(errorHandler);
