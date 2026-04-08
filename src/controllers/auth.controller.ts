import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

export const login = catchAsync(async (req: Request, res: Response) => {
  const { user, token } = await authService.loginUser(req.body.email, req.body.password);
  res.status(200).json({ status: 'success', token, data: { user } });
});

export const register = catchAsync(async (req: Request, res: Response) => {
  const { user, token } = await authService.registerUser(req.body);
  res.status(201).json({ status: 'success', token, data: { user } });
});

export const googleAuthCallback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('فشل تسجيل الدخول بجوجل', 401));
  const token = authService.signToken((req.user as any)._id.toString());
  
  // توجيه المستخدم للفرونت إند (React) مع التوكن
  res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}`);
});