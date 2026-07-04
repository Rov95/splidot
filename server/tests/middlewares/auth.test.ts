import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import authMiddleware from '../../src/middlewares/auth';
import { signToken } from '../../src/utils/jwt';

const mockRes = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware', () => {
  it('calls next() and sets req.userId for a valid Bearer token', () => {
    const req = {
      headers: { authorization: `Bearer ${signToken('user-1')}` },
    } as unknown as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.userId).toBe('user-1');
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responds with 401 when the Authorization header is missing', () => {
    const req = { headers: {} } as unknown as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });

  it('responds with 401 for a malformed / invalid token', () => {
    const req = { headers: { authorization: 'Bearer not-a-real-token' } } as unknown as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });
});
