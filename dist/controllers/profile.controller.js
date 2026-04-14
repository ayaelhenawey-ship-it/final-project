"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = exports.uploadProfileAvatar = exports.deleteMyAccount = exports.getUserProfile = exports.updateMyProfile = exports.getMyProfile = void 0;
const user_1 = require("../models/user");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../utils/AppError");
// 1. جلب بيانات البروفايل الشخصي (لليوزر اللي عامل لوجين)
exports.getMyProfile = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // سحر الميدل وير بتاعك: req.user شايل كل بيانات اليوزر وجاهز!
    res.status(200).json({
        status: 'success',
        data: { user: req.user }
    });
}));
// 2. تحديث بيانات البروفايل
exports.updateMyProfile = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. نمنع اليوزر يغير بيانات حساسة من هنا (رقم التليفون، الإيميل، أو الباسورد ليهم مسارات حماية خاصة)
    if (req.body.password || req.body.email || req.body.phoneNumber) {
        return next(new AppError_1.AppError('The password, email, or phone number cannot be updated from this path.', 400));
    }
    // 2. نفلتر الداتا عشان الهاكرز ميرفعوش الـ role بتاعهم لـ Admin مثلاً!
    let normalizedSkills;
    if (req.body.skills && Array.isArray(req.body.skills)) {
        // ليه بنعمل normalization:
        // عشان نوحد شكل البيانات في الداتا بيز (كله حروف صغيرة ومن غير مسافات زيادة)
        // ده بيحسن جداً من كفاءة البحث وبيمنع تكرار نفس المهارة بأشكال مختلفة (مثلاً React و react و  React)
        const uniqueSkills = [...new Set(req.body.skills.map((skill) => skill.toLowerCase().trim()))];
        // ليه حاطين limit:
        // عشان نحمي الداتا بيز من أحجام البيانات الضخمة (الـ Payload) ونمنع اليوزر إنه يضيف مهارات عشوائية بلا نهاية فده بيحسن الأداء
        if (uniqueSkills.length > 15) {
            return next(new AppError_1.AppError('You cannot add more than 15 skills.', 400));
        }
        normalizedSkills = uniqueSkills;
    }
    const allowedUpdates = {
        fullName: req.body.fullName,
        bio: req.body.bio,
        skills: normalizedSkills !== undefined ? normalizedSkills : req.body.skills,
        portfolioLinks: req.body.portfolioLinks,
        trackName: req.body.trackName,
        companyName: req.body.companyName,
        status: req.body.status
    };
    // تنظيف الأوبجكت من أي قيم undefined عشان منمسحش داتا قديمة
    Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);
    // 3. التحديث في قاعدة البيانات
    const updatedUser = yield user_1.User.findByIdAndUpdate(req.user._id, allowedUpdates, {
        new: true, // يرجع الداتا الجديدة بعد التحديث
        runValidators: true // يتأكد إن الداتا مطابقة لشروط الـ Schema
    });
    res.status(200).json({
        status: 'success',
        message: 'The profile has been updated successfully',
        data: { user: updatedUser }
    });
}));
// 3. جلب بروفايل مستخدم آخر (عشان لو حد عايز يفتح بروفايل زميله)
exports.getUserProfile = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.User.findById(req.params.id);
    if (!user) {
        return next(new AppError_1.AppError('This user was not found.', 404));
    }
    res.status(200).json({
        status: 'success',
        data: { user }
    });
}));
// 4. حذف الحساب الشخصي
exports.deleteMyAccount = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_1.User.findByIdAndDelete(req.user._id);
    res.status(204).json({
        status: 'success',
        data: null
    });
}));
// ==========================================
// 👇 الإضافة الجديدة الخاصة برفع الصورة الشخصية
// ==========================================
// 5. تحديث الصورة الشخصية (Avatar)
exports.uploadProfileAvatar = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. لو اليوزر مبعتش صورة أو الميدل وير رفضها
    if (!req.file) {
        return next(new AppError_1.AppError('Please upload an image file.', 400));
    }
    // 2. ده اللينك اللي رجع من Cloudinary
    const avatarUrl = req.file.path;
    // 3. تحديث اليوزر باللينك الجديد في قاعدة البيانات
    const updatedUser = yield user_1.User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true, runValidators: true });
    res.status(200).json({
        status: 'success',
        message: 'Avatar uploaded successfully',
        data: { user: updatedUser }
    });
}));
// 6. البحث عن المستخدمين (للتوظيف أو التواصل)
exports.searchUsers = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. تجهيز أوبجكت الفلترة الفاضي
    const queryObj = {};
    // أ. البحث بكلمة مفتاحية (Keyword) في الاسم أو المهارات أو النبذة
    if (req.query.keyword) {
        // استخدمنا Regex عشان نبحث عن جزء من الكلمة (حتى لو مش الكلمة كاملة)
        // حرف الـ 'i' معناه (Case-insensitive) عشان يتجاهل الحروف الكابيتال والسمول
        const searchRegex = new RegExp(req.query.keyword, 'i');
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
    const page = parseInt(req.query.page) || 1; // الصفحة الافتراضية 1
    const limit = parseInt(req.query.limit) || 10; // عدد اليوزرز في الصفحة 10
    const skip = (page - 1) * limit; // هنفوت كام يوزر عشان نجيب الصفحة اللي بعدها
    // 3. تنفيذ البحث في قاعدة البيانات
    const users = yield user_1.User.find(queryObj)
        // حماية: بنحدد الداتا اللي هترجع عشان منبعتش الباسورد أو بيانات حساسة
        .select('fullName avatar trackName skills bio companyName status role')
        .skip(skip)
        .limit(limit)
        .sort('-createdAt'); // ترتيب من الأحدث للأقدم
    // 4. حساب العدد الكلي (مهم جداً للفرونت إند عشان يعمل زراير الـ Next و الـ Prev)
    const totalUsers = yield user_1.User.countDocuments(queryObj);
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
}));
