import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import Score from './models/Score';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scores';

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Connect to MongoDB with valid options only
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    console.error('Make sure MongoDB is running on:', MONGODB_URI);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// POST endpoint to insert or update score
app.post('/api/scores', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        success: false,
        error: 'Database not connected',
      });
      return;
    }

    const { score, username } = req.body;

    if (!score || !username) {
      res.status(400).json({
        success: false,
        error: 'Score and username are required',
      });
      return;
    }

    const updatedScore = await Score.findOneAndUpdate(
      { username },
      { 
        score, 
        username,
        date: new Date()
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );

    res.status(201).json({
      success: true,
      data: updatedScore,
    });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save score',
    });
  }
});

// GET endpoint to retrieve all scores
app.get('/api/scores', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        success: false,
        error: 'Database not connected',
      });
      return;
    }

    const scores = await Score.find().sort({ score: -1 });
    res.json({
      success: true,
      data: scores,
    });
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scores',
    });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Start server only after DB connection
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
};

startServer();
