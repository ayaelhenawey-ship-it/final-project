import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import { AppError } from '../utils/AppError';

dotenv.config();

// 1. ربط السيرفر بحسابك على كلاوديناري
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. إعدادات التخزين
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'rabta_avatars', // اسم الفولدر اللي هيتكريت على كلاوديناري
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // مسموح بصور بس
    };
  },
});

// 3. فلتر الأمان (عشان لو يوزر حاول يرفع ملف PDF أو فيروس)
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// 4. تصدير الميدل وير
export const uploadAvatar = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // أقصى حجم للصورة 5 ميجا
});