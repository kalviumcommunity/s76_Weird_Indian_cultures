import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IItem extends Document {
  _id: mongoose.Types.ObjectId;
  CultureName: string;
  CultureDescription: string;
  Region: string;
  Significance: string;
  created_by: mongoose.Types.ObjectId;
  ImageURL: string | null;
  VideoURL: string | null;
  Likes: number;
  Saves: number;
  likedBy: mongoose.Types.ObjectId[];
  savedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
  {
    CultureName: {
      type: String,
      required: true,
      trim: true,
    },
    CultureDescription: {
      type: String,
      required: true,
      trim: true,
    },
    Region: {
      type: String,
      required: true,
      trim: true,
    },
    Significance: {
      type: String,
      required: true,
      trim: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ImageURL: {
      type: String,
      default: null,
    },
    VideoURL: {
      type: String,
      default: null,
    },
    Likes: {
      type: Number,
      default: 0,
    },
    Saves: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    savedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Item: Model<IItem> =
  mongoose.models.Item || mongoose.model<IItem>('Item', itemSchema);

export default Item;
