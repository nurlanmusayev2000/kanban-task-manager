import mongoose, { Document, Schema, Types } from 'mongoose';

interface IComment {
  author: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface ICard extends Document {
  title: string;
  description?: string;
  list: Types.ObjectId;
  board: Types.ObjectId;
  assignees: Types.ObjectId[];
  labels: string[];
  dueDate?: Date;
  position: number;
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new Schema<ICard>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  list: {
    type: Schema.Types.ObjectId,
    ref: 'List',
    required: true,
  },
  board: {
    type: Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  assignees: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  labels: [String],
  dueDate: Date,
  position: {
    type: Number,
    required: true,
    default: 0,
  },
  comments: [{
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, { timestamps: true });

export const Card = mongoose.model<ICard>('Card', cardSchema);
