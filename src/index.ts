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

// Apply CORS globally before anything else
app.use(cors({ origin: true, credentials: true }));

// Handle preflight OPTIONS requests explicitly for Vercel serverless
app.options('*', cors({ origin: true, credentials: true }));

app.use(express.json());

const startServer = async () => {
  await connectDB();
  await server.start();

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
