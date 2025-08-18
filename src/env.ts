import 'dotenv/config';
const need = (k:string)=>{const v=process.env[k]; if(!v) throw new Error(`Missing env ${k}`); return v;};
export const ENV = {
  PORT: Number(process.env.PORT ?? 3000),
  DATABASE_URL: need('DATABASE_URL'),
  JWT: need('JWT_SECRET'),
  JWT_REFRESH: process.env.JWT_REFRESH_SECRET ?? need('JWT_SECRET'),
};
