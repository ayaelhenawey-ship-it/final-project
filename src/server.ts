import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

import { User } from './models/user';
import Chat from './models/chat';
import Message from './models/Message';
import Post from './models/Post';
import Job from './models/Job';

import { notFound, errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = '/api/v1';

// ==========================================
// 🛡️ إعدادات الحماية (Rate Limiting)
// ==========================================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // أقصى عدد طلبات لكل يوزر
  message: { 
    message: "The allowed request limit has been exceeded, please try again after 15 minutes." 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(BASE_URL, apiLimiter); 

app.use(cors());
app.use(express.json());

// ==========================================
// 🗄️ الاتصال بقاعدة البيانات
// ==========================================
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => { 
    console.log('✅ MongoDB Connected');
    console.log('📂 Writing to Database:', mongoose.connection.name);
  })
  .catch(err => console.log('❌ Database Connection Error:', err));

// ==========================================
// 🚀 المسارات (Routes)
// ==========================================

app.get('/test', (req: Request, res: Response) => {
  res.send('Server is running');
});

// مسار جلب كل المستخدمين
app.get(`${BASE_URL}/users`, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find(); 
    res.status(200).json(users);
  } catch (error) {
    next(error); // بنبعت الإيرور للمركز الرئيسي
  }
});

// مسار التسجيل (Register) - متوافق مع التشفير التلقائي في الموديل
app.post(`${BASE_URL}/auth/register`, async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { fullName, email, password, role, trackName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "The email is already registered!" });
    }

    const newUser = new User({
      fullName,
      email,
      password, // بنبعت الباسورد العادي والموديل هيشفره
      role,
      trackName
    });
    
    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '7d' } 
    );
    
    res.status(201).json({
      message: "The account has been successfully created",
      token: token,
      user: {
        id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        role: savedUser.role
      }
    });

  } catch (error: any) {
    next(error);
  }
});

// مسار جلب الوظائف (مدمج ببيانات المستخدم)
app.get(`${BASE_URL}/jobs`, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobs = await Job.find().populate('publisherId', 'fullName email status');
    res.status(200).json(jobs);
  } catch (error: any) {
    next(error);
  }
});

// مسار إضافة وظيفة (Job)
app.post(`${BASE_URL}/jobs`, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newJob = new Job(req.body);
    res.status(201).json(await newJob.save());
  } catch (error: any) {
    next(error);
  }
});

// مسار إضافة محادثة (Chat)
app.post(`${BASE_URL}/chats`, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newChat = new Chat(req.body);
    res.status(201).json(await newChat.save());
  } catch (error: any) {
    next(error);
  }
});

// مسار إضافة رسالة (Message)
app.post(`${BASE_URL}/messages`, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newMessage = new Message(req.body);
    res.status(201).json(await newMessage.save());
  } catch (error: any) {
    next(error);
  }
});

// مسار إضافة منشور (Post)
app.post(`${BASE_URL}/posts`, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newPost = new Post(req.body);
    res.status(201).json(await newPost.save());
  } catch (error: any) {
    next(error);
  }
});

// ==========================================
// 🚨 حراس معالجة الأخطاء (Global Error Handlers)
// يجب أن تظل هذه الأكواد في نهاية الملف دائمًا
// ==========================================

// 1. للتعامل مع الروابط غير الصحيحة
app.use(notFound);

// 2. المركز الرئيسي للأخطاء
app.use(errorHandler);

// ==========================================
// 🌐 تشغيل السيرفر
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Base URL is ready at: http://localhost:${PORT}${BASE_URL}`);
});