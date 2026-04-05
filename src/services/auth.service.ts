import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { AppError } from '../utils/AppError';

// دالة إنشاء التوكن (JWT)
const signToken = (id: string) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET as string, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '90d' } as jwt.SignOptions
  );
};

// خدمة تسجيل الدخول
export const loginUser = async (email: string, password: string) => {
  // 1. التحقق من إدخال البريد الإلكتروني وكلمة المرور
  if (!email || !password) {
    throw new AppError('الرجاء إدخال البريد الإلكتروني وكلمة المرور', 400);
  }

  // 2. البحث عن المستخدم بناءً على البريد الإلكتروني
  // نستخدم select('+password') لأننا قمنا بإخفاء كلمة المرور افتراضياً في النموذج
  const user = await User.findOne({ email }).select('+password');

  // 3. التحقق من وجود المستخدم وصحة كلمة المرور
  if (!user || !(await user.comparePassword(password, user.password as string))) {
    throw new AppError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401);
  }

  // 4. إنشاء التوكن الخاص بالمستخدم
  const token = signToken(user._id.toString());

  // 5. إزالة كلمة المرور من كائن المستخدم قبل إرجاعه للواجهة الأمامية
  user.password = undefined;

  // 6. إرجاع بيانات المستخدم والتوكن
  return { user, token };
};