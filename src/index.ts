import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from './config/passport';
import { connectDatabase, disconnectDatabase } from './database/connection';
import teamRoutes from './routes/teamRoutes';
import scoreRoutes from './routes/scoreRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import { ensureAuthenticated } from './middleware/authMiddleware';

dotenv.config();

if (!process.env.SESSION_SECRET) {
  console.error('🚨 SESSION_SECRET is not set in .env');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions (needed by Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Public routes
app.use('/auth', authRoutes);
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Protect everything under /api/*
app.use('/api', ensureAuthenticated);

// Now mount your API routers
app.use('/api/teams', teamRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/health`);
      console.log(`🔑 Google OAuth: http://localhost:${PORT}/auth/google`);
      console.log(`👥 Teams API: http://localhost:${PORT}/api/teams`);
      console.log(`🎯 Scores API: http://localhost:${PORT}/api/scores`);
      console.log(`👤 Users API: http://localhost:${PORT}/api/users`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await disconnectDatabase();
  process.exit(0);
});

startServer();
