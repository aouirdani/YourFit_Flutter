import jwt from 'jsonwebtoken';
import { ENV } from '../env';
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
export function signAccessToken(sub: string) { return jwt.sign({ sub }, JWT_SECRET, { expiresIn: '15m' }); }
export function signRefreshToken(sub: string) { return jwt.sign({ sub, type: 'refresh' }, JWT_REFRESH_SECRET, { expiresIn: '30d' }); }
export function verifyRefreshToken(token: string) { return jwt.verify(token, JWT_REFRESH_SECRET) as { sub: string }; }

export function issueTokens(userId:string){
  const accessToken = jwt.sign({ sub:userId }, ENV.JWT, { expiresIn:'15m' });
  const refreshToken = jwt.sign({ sub:userId, typ:'refresh' }, ENV.JWT_REFRESH, { expiresIn:'30d' });
  return { accessToken, refreshToken };
}
export const verifyAccess = (t:string)=>jwt.verify(t, ENV.JWT) as {sub:string};
export function verifyRefresh(t:string){
  const p = jwt.verify(t, ENV.JWT_REFRESH) as {sub:string; typ?:string};
  if(p.typ!=='refresh') throw new Error('invalid_token');
  return p;
}
