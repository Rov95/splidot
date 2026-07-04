import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const { userId } = verifyToken(header.slice('Bearer '.length));
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export default authMiddleware;
