import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  avatar?: string;
  fullName: string;
  email: string;
  password?: string; 
  phoneNumber?: string; 
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
  phoneNumber: { type: String, required: true, unique: true },
  googleId: { type: String, unique: true, sparse: true }, // حقل اختياري للربط
  password: { type: String, required: true, select: false },
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
  },
  avatar: { type: String, default: "" }
}, { timestamps: true });

// يعني إيه index: الـ Index زي الفهرس في الكتاب، بيخلي الداتا بيز توصل للمعلومة بسرعة بدل ما تدور في كل السجلات.
// ليه بنستخدمه: عشان نسرع عملية البحث، بالذات على الحقول اللي بنستخدمها كتير في الفلتر زي الاسم والمهارات ومسار الكورس.
// ليه مش بنعمل index لكل حاجة: لأن كل Index بياخد مساحة تخزين وبيبطئ عمليات الإضافة والتعديل (Write cost)، فلازم نوازن ما بين الـ read performance ومابين التكلفة.
UserSchema.index({ fullName: 1 });
UserSchema.index({ skills: 1 });
UserSchema.index({ trackName: 1 });

UserSchema.pre('save', async function (this: any) {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string, userPassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export const User = mongoose.model<IUser>('User', UserSchema);