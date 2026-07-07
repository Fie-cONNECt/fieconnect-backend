import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { getAuthContext } from '../middleware/auth';

describe('Auth Middleware', () => {
  it('should return empty context if no auth header is present', () => {
    const mockReq = { headers: {} } as any;
    const context = getAuthContext(mockReq);
    expect(context).toEqual({});
  });

  it('should return context with userId if valid JWT token is provided', () => {
    const secret = 'test_secret';
    process.env.JWT_SECRET = secret;
    const token = jwt.sign({ userId: '123', email: 'test@example.com' }, secret);
    const mockReq = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as any;

    const context = getAuthContext(mockReq);
    expect(context).toEqual({
      userId: '123',
      userEmail: 'test@example.com',
    });
  });
});
