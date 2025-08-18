import { Router } from 'express';
import { prisma } from '../db';
import { hashPassword, verifyPassword } from '../auth/hash';
import { issueTokens, verifyRefresh } from '../auth/tokens';

export const authRouter = Router();

authRouter.post('/register', async (req,res)=>{
  const {email,password,username}=req.body??{};
  if(!email||!password) return res.status(400).json({code:'bad_request',message:'email and password required'});
  if(await prisma.user.findUnique({where:{email}})) return res.status(409).json({code:'conflict',message:'Email already exists'});
  const user=await prisma.user.create({data:{email,passwordHash:await hashPassword(password),username}});
  const tokens=issueTokens(user.id);
  res.json({...tokens,user:{id:user.id,email:user.email,username:user.username}});
});

authRouter.post('/login', async (req,res)=>{
  const {email,password}=req.body??{};
  if(!email||!password) return res.status(400).json({code:'bad_request',message:'email and password required'});
  const user=await prisma.user.findUnique({where:{email}});
  if(!user) return res.status(401).json({code:'unauthorized',message:'Invalid credentials'});
  if(!await verifyPassword(password,user.passwordHash)) return res.status(401).json({code:'unauthorized',message:'Invalid credentials'});
  const tokens=issueTokens(user.id);
  res.json({...tokens,user:{id:user.id,email:user.email,username:user.username}});
});

authRouter.post('/refresh', async (req,res)=>{
  const {refreshToken}=req.body??{};
  if(!refreshToken) return res.status(400).json({code:'bad_request',message:'refreshToken required'});
  try{ const p=verifyRefresh(refreshToken); return res.json({accessToken:issueTokens(p.sub).accessToken}); }
  catch{ return res.status(401).json({code:'unauthorized',message:'Invalid refresh token'}); }
});

authRouter.get('/check-email', async (req, res) => {
  const email = String(req.query.email || '').toLowerCase();
  if (!email) return res.status(400).json({ exists: false, error: 'email required' });
  const exists = !!(await prisma.user.findUnique({ where: { email } }));
  res.json({ exists });
});