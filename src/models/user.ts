import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string; 
  phoneNumber?: string; 
  role: 'student' | 'freelancer' | 'employer';
  trackName?: string;
  skills?: string[];
  portfolioLinks?: string[];
  companyName?: string;
  bio?: string;
  status: 'online' | 'offline' | 'busy';
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidatePassword: string, userPassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  googleId: { type: String, sparse: true }, // حقل اختياري للي هيربط حسابه
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

UserSchema.pre('save', async function (this: any) {  
  if (!this.isModified('password')) return;
  
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string, 
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export const User = mongoose.model<IUser>('User', UserSchema);