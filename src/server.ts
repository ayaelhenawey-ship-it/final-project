import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// 👈 استيراد ملف المسارات المجمع
import apiRoutes from './routes'; 

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
// 🚀 ربط المسارات بالسيرفر
// ==========================================
// السطر ده بيقول للسيرفر: أي ريكويست يبدأ بـ /api/v1، ابعته لملف الـ routes يتصرف معاه
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