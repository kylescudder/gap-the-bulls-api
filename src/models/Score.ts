import mongoose, { Document, Schema } from 'mongoose';

export interface IScore extends Document {
  score: number;
  username: string;
  date: Date;
}

const ScoreSchema: Schema = new Schema({
  score: {
    type: Number,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
});

export default mongoose.model<IScore>('Score', ScoreSchema);
