import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { getAuthContext } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  await connectDB();
  await server.start();

  const allowedOrigins = ['http://localhost:3000', 'https://fie-connect.vercel.app'];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isAllowed =
          allowedOrigins.includes(origin) ||
          origin.startsWith('http://localhost:') ||
          origin.endsWith('.vercel.app');
        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }),
  );
  app.use(express.json());

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req, res }) => ({
        ...getAuthContext(req),
        res,
      }),
    }),
  );

  // Only listen when running locally, Vercel will handle serverless execution
  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}/graphql`);
    });
  }
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

export default app;
