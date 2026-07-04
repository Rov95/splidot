import 'express';

declare global {
  namespace Express {
    interface Request {
      // Set by authMiddleware after verifying the Bearer JWT.
      userId?: string;
    }
  }
}
