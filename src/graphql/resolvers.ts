import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { Resolvers } from './__generated__/resolvers-types';

const generateToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  });
};

export const resolvers: Resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.userId) {
        return null;
      }
      const user = await User.findById(context.userId);
      if (!user) return null;
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    },
  },
  Mutation: {
    register: async (_, { firstName, lastName, email, password, userType, phone }, context) => {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      const user = new User({ firstName, lastName, email: email.toLowerCase(), password, userType, phone });
      await user.save();

      const token = generateToken(user.id, user.email);

      if (context.res) {
        context.res.setHeader(
          'Set-Cookie',
          `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
        );
      }

      return {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
          phone: user.phone,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      };
    },
    login: async (_, { email, password }, context) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isMatch = await (user as any).comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }

      const token = generateToken(user.id, user.email);

      if (context.res) {
        context.res.setHeader(
          'Set-Cookie',
          `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
        );
      }

      return {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
          phone: user.phone,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      };
    },
    logout: async (_, __, context) => {
      if (context.res) {
        context.res.setHeader(
          'Set-Cookie',
          `token=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
        );
      }
      return true;
    },
  },
};
