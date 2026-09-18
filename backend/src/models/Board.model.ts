import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBoard extends Document {
  title: string;
  description?: string;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema = new Schema<IBoard>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  color: {
    type: String,
    default: '#3B82F6',
  },
}, { timestamps: true });

export const Board = mongoose.model<IBoard>('Board', boardSchema);
