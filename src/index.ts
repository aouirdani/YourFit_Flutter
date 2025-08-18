import helmet from 'helmet';
import cors from 'cors';
import { ENV } from './env';
import { authRouter } from './routes/auth';
import { meRouter } from './routes/me';
import express, { Request, Response } from 'express';



const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));
app.get('/health', (_req,res)=>res.json({ok:true}));
app.use('/api/auth', authRouter);
app.use('/api', meRouter);

app.use((err:any,_req:any,res:any,_next:any)=>{ console.error(err); res.status(500).json({code:'server_error',message:'Unexpected error'}); });

app.listen(ENV.PORT, ()=>console.log(`API on :${ENV.PORT}`));
