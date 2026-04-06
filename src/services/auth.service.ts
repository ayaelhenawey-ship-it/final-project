import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { AppError } from '../utils/AppError';

export const signToken = (id: string) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET as string, 
    { expiresIn: (process.env.JWT_EXPIRES_IN || '90d') as any }
  );
};

export const loginUser = async (email: string, password: string) => {
  if (!email || !password) throw new AppError('الرجاء إدخال البيانات', 400);
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password, user.password as string))) {
    throw new AppError('البيانات غير صحيحة', 401);
  }
  const token = signToken(user._id.toString());
  user.password = undefined;
  return { user, token };
};

export const registerUser = async (userData: any) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) throw new AppError('المستخدم موجود بالفعل', 400);
  const newUser = await User.create(userData);
  const token = signToken(newUser._id.toString());
  newUser.password = undefined;
  return { user: newUser, token };
};