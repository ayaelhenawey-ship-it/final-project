import mongoose, { Schema, Document } from 'mongoose';

// 1. تعريف الأنواع (Interface)
export interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  content: string;
  media?: {
    fileUrl: string;
    fileType: string;
  }[];
  likes?: mongoose.Types.ObjectId[];
  comments?: {
    userId: mongoose.Types.ObjectId;
    commentText: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// 2. إنشاء الـ Schema
const PostSchema: Schema = new Schema({
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  media: [{
    fileUrl: String,
    fileType: String
  }],
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    commentText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model<IPost>('Post', PostSchema);