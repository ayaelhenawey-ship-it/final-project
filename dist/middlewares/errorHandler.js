"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
// 1. مسار للتعامل مع الروابط الغلط (404 Not Found)
const notFound = (req, res, next) => {
    const error = new Error(`The link does not exist- ${req.originalUrl}`);
    res.status(404);
    next(error);
};
exports.notFound = notFound;
// 2. المركز الرئيسي لمعالجة الأخطاء (Global Error Handler)
const errorHandler = (err, req, res, next) => {
    // 👈 التعديل السحري هنا: بنسأله الأول، هل الإيرور جايب معاه statusCode؟ (زي بتاع AppError)
    let statusCode = err.statusCode || res.statusCode;
    // لو لسه 200 (يعني مفيش حد حدد كود)، نخليه 500 كخطأ سيرفر
    statusCode = statusCode === 200 ? 500 : statusCode;
    let message = err.message;
    // --- تحسين رسائل أخطاء قاعدة البيانات (MongoDB) ---
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'The requested item was not found, please check the ID for accuracy.';
    }
    if (err.code === 11000) {
        statusCode = 400;
        message = 'These data (such as email or phone number) are already registered with us.';
    }
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((val) => val.message).join(', ');
    }
    // الرد النهائي
    res.status(statusCode).json({
        status: err.status || 'error', // ضفنا الـ status عشان تبقى ماشية مع AppError
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
exports.errorHandler = errorHandler;
