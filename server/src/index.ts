import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';
import { userRouter, groupRouter, expenseRouter, categoryRouter } from './router';
import { sequelize } from './models';

const app = express();

if (!process.env.SECRET_KEY) {
  throw new Error('SECRET_KEY is missing from environment variables');
}

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
app.use('/groups', groupRouter);
app.use('/expenses', expenseRouter);
app.use('/categories', categoryRouter);

const port = 3000;

sequelize
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://127.0.0.1:${port}`);
    });
  })
  .catch((error) => console.error('Failed to sync DB: ', error));
