import { Request } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthContext {
  userId?: string;
  userEmail?: string;
}

export const getAuthContext = (req: Request): AuthContext => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return {};
  }

  const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"
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
