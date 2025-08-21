import helmet from 'helmet';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import { ENV } from './env';
import { authRouter } from './routes/auth';
import { meRouter } from './routes/me';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '1mb' }));

// Healthcheck UNIQUE
app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

// Routes API
app.use('/api/auth', authRouter);
app.use('/api', meRouter);

// 404 lisible
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'not_found' });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ code: 'server_error', message: 'Unexpected error' });
});

// Boot
const PORT = Number(ENV.PORT ?? process.env.PORT ?? 3000);
console.log('Booting API with PORT=', PORT, 'NODE_ENV=', process.env.NODE_ENV);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API on :${PORT} (0.0.0.0)`);
});
