import { Request, Response, NextFunction } from 'express';

// 1. مسار للتعامل مع الروابط الغلط (404 Not Found)
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`The link does not exist- ${req.originalUrl}`);
  res.status(404);
  next(error); // بيبعت الإيرور للمركز الرئيسي تحت
};

// 2. المركز الرئيسي لمعالجة الأخطاء (Global Error Handler)
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // بنحدد كود الخطأ، لو مفيش كود بنخليه 500 (مشكلة في السيرفر)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // --- تحسين رسائل أخطاء قاعدة البيانات (MongoDB) ---
  
  // أ. لو الـ ID اللي مبعوت مش مظبوط (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'The requested item was not found, please make sure the ID is correct.';
  }

  // ب. لو بيحاول يسجل بيانات متكررة (زي إيميل موجود قبل كده)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'This data (such as the email) is already registered with us.';
  }

  // ج. أخطاء التحقق من صحة البيانات (Validation Error)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // بنجمع كل رسائل الخطأ ونفصل بينهم بفاصلة
    message = Object.values(err.errors).map((val: any) => val.message).join(', ');
  }

  // الرد النهائي اللي هيروح للـ Front-end
  res.status(statusCode).json({
    message: message,
    // الـ stack بيورينا مكان الإيرور فين بالظبط، بنشغله وإحنا شغالين بس وبنقفله لما نرفع الموقع
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};