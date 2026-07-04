import jwt from 'jsonwebtoken';

// app.ts throws on startup if SECRET_KEY is missing, so it's safe to assert here.
const SECRET = process.env.SECRET_KEY as string;
const EXPIRES_IN = '90d';

export interface TokenPayload {
  userId: string;
}

export const signToken = (userId: string): string =>
  jwt.sign({ userId }, SECRET, { expiresIn: EXPIRES_IN });

export const verifyToken = (token: string): TokenPayload =>
  jwt.verify(token, SECRET) as TokenPayload;
