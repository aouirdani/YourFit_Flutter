// src/routes/auth.ts
import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { hashPassword, verifyPassword } from '../auth/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../auth/tokens';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ code: 'bad_request', message: 'email and password required' });

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ code: 'conflict', message: 'email already in use' });

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email: normalizedEmail, passwordHash, username: username ?? null },
      select: { id: true, email: true, username: true },
    });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    return res.json({ accessToken, refreshToken, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: 'server_error', message: 'internal error' });
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ code: 'bad_request', message: 'email and password required' });

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return res.status(401).json({ code: 'unauthorized', message: 'invalid credentials' });

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ code: 'unauthorized', message: 'invalid credentials' });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    return res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: 'server_error', message: 'internal error' });
  }
});

authRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body ?? {};
    if (!refreshToken) return res.status(400).json({ code: 'bad_request', message: 'refreshToken required' });

    const { sub: userId } = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ code: 'unauthorized', message: 'invalid token' });

    const accessToken = signAccessToken(user.id);
    return res.json({ accessToken });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ code: 'unauthorized', message: 'invalid token' });
  }
});

// Email availability for signup flow
authRouter.get('/check-email', async (req: Request, res: Response) => {
  try {
    const email = String(req.query.email ?? '').toLowerCase().trim();
    if (!email) return res.status(400).json({ exists: false, error: 'email required' });
    const exists = !!(await prisma.user.findUnique({ where: { email } }));
    return res.json({ exists });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ exists: false, error: 'server_error' });
  }
});

export default authRouter;
