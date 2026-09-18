import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IList extends Document {
  title: string;
  board: Types.ObjectId;
  position: number;
  createdAt: Date;
}

const listSchema = new Schema<IList>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  board: {
    type: Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  position: {
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const List = mongoose.model<IList>('List', listSchema);
