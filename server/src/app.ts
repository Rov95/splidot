import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
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
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    name: 'rovix',
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    },
    proxy: true,
  })
);

app.use('/users', userRouter);
app.use('/groups', authMiddleware, groupRouter);
app.use('/settlements', authMiddleware, settlementRouter);
