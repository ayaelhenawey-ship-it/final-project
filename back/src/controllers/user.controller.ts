import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user';
import { catchAsync } from '../utils/catchAsync';
import { ApiFeatures } from '../utils/ApiFeatures';

// جلب كل المستخدمين (مع الفلترة الذكية)
export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // بناء الاستعلام الذكي وتمرير الفلاتر
    const features = new ApiFeatures(User.find(), req.query)
      .filter() // فلترة بالتراك أو الدور (student/graduate)
      .search(["fullName", "trackName", "email"]) // البحث بكلمة مفتاحية
      .sort()
      .paginate();

    // تنفيذ الاستعلام
    const users = await features.mongooseQuery;

    res.status(200).json({
      status: "success",
      results: users.length,
      data: users
    });
  }
);