import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import authMiddleware from '../../src/middlewares/auth';

const mockRes = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware', () => {
  it('calls next() when the session has a userId', () => {
    const req = { session: { userId: 'user-1' } } as unknown as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responds with 401 when there is no userId in the session', () => {
    const req = { session: {} } as unknown as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });
});
