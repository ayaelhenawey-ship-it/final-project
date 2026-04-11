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

// ==========================================
// 👇 الإضافة الجديدة الخاصة برفع الصورة الشخصية
// ==========================================

// 5. تحديث الصورة الشخصية (Avatar)
export const uploadProfileAvatar = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1. لو اليوزر مبعتش صورة أو الميدل وير رفضها
  if (!req.file) {
    return next(new AppError('Please upload an image file.', 400));
  }

  // 2. ده اللينك اللي رجع من Cloudinary
  const avatarUrl = req.file.path;

  // 3. تحديث اليوزر باللينك الجديد في قاعدة البيانات
  const updatedUser = await User.findByIdAndUpdate(
    req.user!._id, 
    { avatar: avatarUrl }, 
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Avatar uploaded successfully',
    data: { user: updatedUser }
  });
});

// 6. البحث عن المستخدمين (للتوظيف أو التواصل)
export const searchUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1. تجهيز أوبجكت الفلترة الفاضي
  const queryObj: any = {};

  // أ. البحث بكلمة مفتاحية (Keyword) في الاسم أو المهارات أو النبذة
  if (req.query.keyword) {
    // استخدمنا Regex عشان نبحث عن جزء من الكلمة (حتى لو مش الكلمة كاملة)
    // حرف الـ 'i' معناه (Case-insensitive) عشان يتجاهل الحروف الكابيتال والسمول
    const searchRegex = new RegExp(req.query.keyword as string, 'i');
    
    queryObj.$or = [
      { fullName: searchRegex },
      { skills: searchRegex },
      { bio: searchRegex }
    ];
  }

  // ب. الفلترة المباشرة باسم التراك (مسار الـ ITI)
  if (req.query.trackName) {
    queryObj.trackName = req.query.trackName;
  }

  // 2. إعدادات تقسيم الصفحات (Pagination)
  const page = parseInt(req.query.page as string) || 1; // الصفحة الافتراضية 1
  const limit = parseInt(req.query.limit as string) || 10; // عدد اليوزرز في الصفحة 10
  const skip = (page - 1) * limit; // هنفوت كام يوزر عشان نجيب الصفحة اللي بعدها

  // 3. تنفيذ البحث في قاعدة البيانات
  const users = await User.find(queryObj)
    // حماية: بنحدد الداتا اللي هترجع عشان منبعتش الباسورد أو بيانات حساسة
    .select('fullName avatar trackName skills bio companyName status role') 
    .skip(skip)
    .limit(limit)
    .sort('-createdAt'); // ترتيب من الأحدث للأقدم

  // 4. حساب العدد الكلي (مهم جداً للفرونت إند عشان يعمل زراير الـ Next و الـ Prev)
  const totalUsers = await User.countDocuments(queryObj);

  res.status(200).json({
    status: 'success',
    results: users.length, // عدد اليوزرز في الصفحة دي
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers: totalUsers
    },
    data: { users }
  });
});