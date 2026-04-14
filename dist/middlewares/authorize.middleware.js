"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = void 0;
const AppError_1 = require("../utils/AppError");
// إن ده layer حماية بعد authentication
// الفرق بين authentication و authorization:
// Authentication (التوثيق): بنحدد "إنت مين" (عن طريق الـ Token أو اللوجين).
// Authorization (التصريح): ده layer حماية بعد authentication وبيحدد "إيه اللي مسموحلك تعمله" بناءً على دورك (زي student أو employer).
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError_1.AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
