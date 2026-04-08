import dotenv from 'dotenv';
dotenv.config(); // 👈 تعديل زميلتك عشان المتغيرات تتقري بدري
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// 1. استيراد إعدادات Passport (من شغل زميلتك)
import passport from 'passport';
import './config/passport';

// 2. استيراد المسارات (دمج الشغلين)
import authRoutes from './routes/authRoutes'; // مسارات زميلتك
import apiRoutes from './routes'; // مساراتك النظيفة المجمعة

import { notFound, errorHandler } from './middlewares/errorHandler';

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
// 🔑 تهيئة المصادقة عبر Passport (من شغل زميلتك)
// ==========================================
app.use(passport.initialize());

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
// 🚀 ربط المسارات بالسيرفر
// ==========================================

// مسار تجريبي
app.get('/test', (req: Request, res: Response) => {
  res.send('Server is running');
});

// مسارات المصادقة الخاصة بزميلتك (Login, Register, Google Auth)
app.use(`${BASE_URL}/auth`, authRoutes);

// باقي المسارات بتاعتك النظيفة (Jobs, Chats, Posts, Link-Google)
app.use(BASE_URL, apiRoutes);

// ==========================================
// 🚨 حراس معالجة الأخطاء (Global Error Handlers)
// ==========================================
app.use(notFound);
app.use(errorHandler);

// ==========================================
// 🌐 تشغيل السيرفر
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Base URL is ready at: http://localhost:${PORT}${BASE_URL}`);
});