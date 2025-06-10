import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Score from './models/Score';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scores';

app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// POST endpoint to insert or update score
app.post('/api/scores', async (req: Request, res: Response) => {
  console.log(req)
  try {
    const { score, username } = req.body;

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
      error: error,
    });
  }
});

// GET endpoint to retrieve all scores (optional)
app.get('/api/scores', async (req: Request, res: Response) => {
  try {
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
