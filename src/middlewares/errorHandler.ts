import { Request, Response, NextFunction } from 'express';

// 1. مسار للتعامل مع الروابط الغلط (404 Not Found)
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`الرابط غير موجود - ${req.originalUrl}`);
  res.status(404);
  next(error); 
};

// 2. المركز الرئيسي لمعالجة الأخطاء (Global Error Handler)
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // 👈 التعديل السحري هنا: بنسأله الأول، هل الإيرور جايب معاه statusCode؟ (زي بتاع AppError)
  let statusCode = err.statusCode || res.statusCode;
  
  // لو لسه 200 (يعني مفيش حد حدد كود)، نخليه 500 كخطأ سيرفر
  statusCode = statusCode === 200 ? 500 : statusCode;
  
  let message = err.message;

  // --- تحسين رسائل أخطاء قاعدة البيانات (MongoDB) ---
  
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'لم يتم العثور على العنصر المطلوب، تأكد من صحة الـ ID.';
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'هذه البيانات (مثل البريد الإلكتروني أو رقم الهاتف) مسجلة بالفعل لدينا.';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val: any) => val.message).join(', ');
  }

  // الرد النهائي
  res.status(statusCode).json({
    status: err.status || 'error', // ضفنا الـ status عشان تبقى ماشية مع AppError
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};