import type { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../auth/tokens';
export interface AuthedRequest extends Request { userId?: string }
export function auth(){
  return (req:AuthedRequest,res:Response,next:NextFunction)=>{
    const h=req.header('authorization')??''; const t=h.startsWith('Bearer ')?h.slice(7):null;
    if(!t) return res.status(401).json({code:'unauthorized',message:'Missing token'});
    try{ req.userId=verifyAccess(t).sub; next(); }
    catch{ return res.status(401).json({code:'unauthorized',message:'Invalid token'}); }
  };
}
