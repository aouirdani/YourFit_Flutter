// Charge .env seulement en dev/local. En prod (Railway), on n’essaie pas.
if (process.env.NODE_ENV !== 'production') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('dotenv').config();
  } catch {
    // pas grave si dotenv n'est pas installé en prod
  }
}

const need = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env ${k}`);
  return v;
};

export const ENV = {
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: need('DATABASE_URL'),
  DIRECT_URL: process.env.DIRECT_URL, // si tu l'utilises côté Prisma
  JWT: need('JWT_SECRET'),
  JWT_REFRESH: process.env.JWT_REFRESH_SECRET ?? need('JWT_SECRET'),
};
