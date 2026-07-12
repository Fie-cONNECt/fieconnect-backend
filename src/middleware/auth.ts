import { Request } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthContext {
  userId?: string;
  userEmail?: string;
  res?: any;
}

const parseCookies = (cookieHeader: string | undefined): Record<string, string> => {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    list[parts.shift()!.trim()] = decodeURI(parts.join('='));
  });
  return list;
};

export const getAuthContext = (req: Request): AuthContext => {
  let token = '';
  const authHeader = req.headers.authorization;
  if (authHeader) {
    token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"
  } else {
    const cookies = parseCookies(req.headers.cookie);
    token = cookies['token'] || '';
  }

  if (!token) {
    return {};
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as {
      userId: string;
      email: string;
    };
    return {
      userId: decoded.userId,
      userEmail: decoded.email,
    };
  } catch (error) {
    return {};
  }
};
