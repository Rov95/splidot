import express from 'express';
import cors from 'cors';
import { userRouter, groupRouter, settlementRouter } from './router';
import authMiddleware from './middlewares/auth';

if (!process.env.SECRET_KEY) {
  throw new Error('SECRET_KEY is missing from environment variables');
}

export const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);
app.use(express.json());

app.use('/users', userRouter);
app.use('/groups', authMiddleware, groupRouter);
app.use('/settlements', authMiddleware, settlementRouter);
