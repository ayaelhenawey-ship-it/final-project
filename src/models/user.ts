import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  googleId?: string;
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
  googleId: { type: String, unique: true, sparse: true },
  password: { 
    type: String, 
    required: function(this: any) { return !this.googleId; }, // مطلوبة فقط إذا لم يوجد حساب جوجل
    select: false 
  },
  role: { 
    type: String, 
    enum: ['student', 'freelancer', 'employer'], 
    default: 'student',
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
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string, userPassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export const User = mongoose.model<IUser>('User', UserSchema);