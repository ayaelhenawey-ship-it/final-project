import mongoose, { Schema, Document } from 'mongoose';


export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'freelancer' | 'employer';
  trackName?: string;
  skills?: string[];
  portfolioLinks?: string[];
  companyName?: string;
  bio?: string;
  status: 'online' | 'offline' | 'busy';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'freelancer', 'employer'], 
    required: true 
  },
  trackName: { type: String },
  skills: [{ type: String }],
  portfolioLinks: [{ type: String }],
  companyName: { type: String },
  bio: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ['online', 'offline', 'busy'], 
    default: 'offline' 
  }
}, { timestamps: true });


export default mongoose.model<IUser>('User', UserSchema);