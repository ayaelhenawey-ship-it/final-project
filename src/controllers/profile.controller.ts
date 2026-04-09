import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

// 1. جلب بيانات البروفايل الشخصي (لليوزر اللي عامل لوجين)
export const getMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // سحر الميدل وير بتاعك: req.user شايل كل بيانات اليوزر وجاهز!
  res.status(200).json({
    status: 'success',
    data: { user: req.user }
  });
});

// 2. تحديث بيانات البروفايل
export const updateMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1. نمنع اليوزر يغير بيانات حساسة من هنا (رقم التليفون، الإيميل، أو الباسورد ليهم مسارات حماية خاصة)
  if (req.body.password || req.body.email || req.body.phoneNumber) {
    return next(new AppError('The password, email, or phone number cannot be updated from this path.', 400));
  }

  // 2. نفلتر الداتا عشان الهاكرز ميرفعوش الـ role بتاعهم لـ Admin مثلاً!
  const allowedUpdates = {
    fullName: req.body.fullName,
    bio: req.body.bio,
    skills: req.body.skills,
    portfolioLinks: req.body.portfolioLinks,
    trackName: req.body.trackName,
    companyName: req.body.companyName,
    status: req.body.status
  };

  // تنظيف الأوبجكت من أي قيم undefined عشان منمسحش داتا قديمة
  Object.keys(allowedUpdates).forEach(key => (allowedUpdates as any)[key] === undefined && delete (allowedUpdates as any)[key]);

  // 3. التحديث في قاعدة البيانات
  const updatedUser = await User.findByIdAndUpdate(req.user!._id, allowedUpdates, {
    new: true, // يرجع الداتا الجديدة بعد التحديث
    runValidators: true // يتأكد إن الداتا مطابقة لشروط الـ Schema
  });

  res.status(200).json({
    status: 'success',
    message: 'The profile has been updated successfully',
    data: { user: updatedUser }
  });
});

// 3. جلب بروفايل مستخدم آخر (عشان لو حد عايز يفتح بروفايل زميله)
export const getUserProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('This user was not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// 4. حذف الحساب الشخصي
export const deleteMyAccount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await User.findByIdAndDelete(req.user!._id);
  
  res.status(204).json({ // 204 No Content
    status: 'success',
    data: null
  });
});