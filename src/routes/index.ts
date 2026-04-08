import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// استيراد النماذج (Models)
import { User } from '../models/user';
import Chat from '../models/chat';
import Message from '../models/Message';
import Post from '../models/Post';
import Job from '../models/Job';

// استيراد أدوات الحماية ومعالجة الأخطاء
import { protect } from '../middlewares/auth.middleware';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

// إنشاء الـ Router
const router = Router();

// ==========================================
// 🚀 المسارات (Routes)
// ملاحظة: مسحنا كلمة BASE_URL من هنا لأننا هنربطها في السيرفر الرئيسي
// ==========================================

router.get('/test', (req: Request, res: Response) => {
  res.send('Server is running');
});

// مسار جلب كل المستخدمين
router.get('/users', catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const users = await User.find(); 
  res.status(200).json(users);
}));

// مسار التسجيل (Register)
router.post('/auth/register', catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { fullName, email, password, phoneNumber, role, trackName } = req.body;

  if (!phoneNumber) {
    return next(new AppError('Phone number is required!', 400));
  }

  const existingUser = await User.findOne({
    $or: [{ email: email }, { phoneNumber: phoneNumber }]
  });

  if (existingUser) {
    return next(new AppError('The email or phone number is already registered!', 400));
  }

  const newUser = new User({
    fullName, email, password, phoneNumber, role, trackName
  });
  
  const savedUser = await newUser.save();

  const token = jwt.sign(
    { id: savedUser._id, role: savedUser.role }, 
    process.env.JWT_SECRET as string, 
    { expiresIn: '7d' } 
  );
  
  res.status(201).json({
    status: 'success',
    message: "The account has been successfully created",
    token: token,
    user: {
      id: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      phoneNumber: savedUser.phoneNumber,
      role: savedUser.role
    }
  });
}));

// مسار ربط حساب جوجل (مسار محمي)
// مسار ربط حساب جوجل (مسار محمي)
router.post('/users/link-google', protect, catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { googleId } = req.body;

  if (!googleId) {
    return next(new AppError('Google ID is required', 400));
  }

  const existingGoogleUser = await User.findOne({ googleId });
  if (existingGoogleUser) {
    return next(new AppError('This Google account is already linked to another user.', 400));
  }

  // 👇 التعديل السحري هنا: ضفنا as any 👇
  const user = req.user as any; 
  
  user.googleId = googleId;
  await user.save();

  res.status(200).json({ 
    status: 'success',
    message: "Google account has been successfully linked",
    user: {
      id: user._id,
      fullName: user.fullName,
      googleId: user.googleId
    }
  });
}));

// مسار جلب الوظائف
router.get('/jobs', catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const jobs = await Job.find().populate('publisherId', 'fullName email status');
  res.status(200).json(jobs);
}));

// مسار إضافة وظيفة
router.post('/jobs', catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newJob = new Job(req.body);
  res.status(201).json(await newJob.save());
}));

// مسار إضافة محادثة
router.post('/chats', catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newChat = new Chat(req.body);
  res.status(201).json(await newChat.save());
}));

// مسار إضافة رسالة
router.post('/messages', catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newMessage = new Message(req.body);
  res.status(201).json(await newMessage.save());
}));

// مسار إضافة منشور
router.post('/posts', catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newPost = new Post(req.body);
  res.status(201).json(await newPost.save());
}));

export default router;