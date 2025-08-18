import { Router } from 'express';
import { prisma } from '../db';
import { auth, AuthedRequest } from '../mw/auth';

export const meRouter = Router();

meRouter.get('/me', auth(), async (req:AuthedRequest,res)=>{
  const u=await prisma.user.findUnique({where:{id:req.userId!},include:{profile:true}});
  if(!u) return res.status(404).json({code:'not_found',message:'User not found'});
  res.json({id:u.id,email:u.email,username:u.username,profile:u.profile,subscription:{active:false,status:'none',renewsAt:null}});
});

meRouter.patch('/me', auth(), async (req:AuthedRequest,res)=>{
  const {profile={},...rest}=req.body??{};
  const u=await prisma.user.update({
    where:{id:req.userId!},
    data:{
      username: typeof rest.username==='string'?rest.username:undefined,
      profile:{ upsert:{ create:{...profile}, update:{...profile} } },
    },
    include:{profile:true},
  });
  res.json({id:u.id,email:u.email,username:u.username,profile:u.profile});
});
