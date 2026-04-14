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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// استيراد النماذج (Models)
const user_1 = require("../models/user");
const chat_1 = __importDefault(require("../models/chat"));
const Message_1 = __importDefault(require("../models/Message"));
const Post_1 = __importDefault(require("../models/Post"));
const Job_1 = __importDefault(require("../models/Job"));
// استيراد أدوات الحماية ومعالجة الأخطاء
const auth_middleware_1 = require("../middlewares/auth.middleware");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../utils/AppError");
const profile_controller_1 = require("../controllers/profile.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const profile_controller_2 = require("../controllers/profile.controller");
const authorize_middleware_1 = require("../middlewares/authorize.middleware");
// إنشاء الـ Router
const router = (0, express_1.Router)();
// ==========================================
// 🚀 المسارات (Routes)
// ملاحظة: مسحنا كلمة BASE_URL من هنا لأننا هنربطها في السيرفر الرئيسي
// ==========================================
router.get('/test', (req, res) => {
    res.send('Server is running');
});
// مسار جلب كل المستخدمين
router.get('/users', (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_1.User.find();
    res.status(200).json(users);
})));
// مسار التسجيل (Register)
router.post('/auth/register', (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, password, phoneNumber, role, trackName } = req.body;
    if (!phoneNumber) {
        return next(new AppError_1.AppError('Phone number is required!', 400));
    }
    const existingUser = yield user_1.User.findOne({
        $or: [{ email: email }, { phoneNumber: phoneNumber }]
    });
    if (existingUser) {
        return next(new AppError_1.AppError('The email or phone number is already registered!', 400));
    }
    const newUser = new user_1.User({
        fullName, email, password, phoneNumber, role, trackName
    });
    const savedUser = yield newUser.save();
    const token = jsonwebtoken_1.default.sign({ id: savedUser._id, role: savedUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
        status: 'success',
        message: "The account has been successfully created",
        token: token,
        user: {
            id: savedUser._id,
            fullName: savedUser.fullName,
            email: savedUser.email,
            phoneNumber: savedUser.phoneNumber,
            role: savedUser.role
        }
    });
})));
// مسار ربط حساب جوجل (مسار محمي)
// مسار ربط حساب جوجل (مسار محمي)
router.post('/users/link-google', auth_middleware_1.protect, (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { googleId } = req.body;
    if (!googleId) {
        return next(new AppError_1.AppError('Google ID is required', 400));
    }
    const existingGoogleUser = yield user_1.User.findOne({ googleId });
    if (existingGoogleUser) {
        return next(new AppError_1.AppError('This Google account is already linked to another user.', 400));
    }
    // 👇 التعديل السحري هنا: ضفنا as any 👇
    const user = req.user;
    user.googleId = googleId;
    yield user.save();
    res.status(200).json({
        status: 'success',
        message: "Google account has been successfully linked",
        user: {
            id: user._id,
            fullName: user.fullName,
            googleId: user.googleId
        }
    });
})));
// مسار جلب الوظائف
router.get('/jobs', auth_middleware_1.protect, (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const jobs = yield Job_1.default.find().populate('publisherId', 'fullName email status');
    res.status(200).json(jobs);
})));
// مسار إضافة وظيفة
router.post('/jobs', auth_middleware_1.protect, (0, authorize_middleware_1.restrictTo)('employer'), (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newJob = new Job_1.default(Object.assign(Object.assign({}, req.body), { publisherId: req.user._id }));
    res.status(201).json(yield newJob.save());
})));
// مسار التقديم على الوظيفة
router.post('/jobs/:id/apply', auth_middleware_1.protect, (0, authorize_middleware_1.restrictTo)('student', 'freelancer'), (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const job = yield Job_1.default.findById(req.params.id);
    if (!job)
        return next(new AppError_1.AppError('Job not found', 404));
    if (!job.applicants)
        job.applicants = [];
    job.applicants.push({
        userId: req.user._id,
        proposal: req.body.proposal,
        status: 'pending',
        appliedAt: new Date()
    });
    yield job.save();
    res.status(200).json({ status: 'success', message: 'Applied successfully' });
})));
// مسار حذف الوظيفة (OWN jobs)
router.delete('/jobs/:id', auth_middleware_1.protect, (0, authorize_middleware_1.restrictTo)('employer'), (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const job = yield Job_1.default.findById(req.params.id);
    if (!job)
        return next(new AppError_1.AppError('Job not found', 404));
    // التأكد من أن صاحب الوظيفة هو اللي بيمسحها
    if (job.publisherId.toString() !== req.user._id.toString()) {
        return next(new AppError_1.AppError('You can only delete your own jobs', 403));
    }
    yield job.deleteOne();
    res.status(204).json({ status: 'success', data: null });
})));
// مسار رؤية المتقدمين (لمنشئ الوظيفة)
router.get('/jobs/:id/applicants', auth_middleware_1.protect, (0, authorize_middleware_1.restrictTo)('employer'), (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const job = yield Job_1.default.findById(req.params.id).populate('applicants.userId', 'fullName email skills phoneNumber');
    if (!job)
        return next(new AppError_1.AppError('Job not found', 404));
    if (job.publisherId.toString() !== req.user._id.toString()) {
        return next(new AppError_1.AppError('You can only view applicants for your own jobs', 403));
    }
    res.status(200).json({ status: 'success', data: { applicants: job.applicants } });
})));
// مسار إضافة محادثة
router.post('/chats', (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newChat = new chat_1.default(req.body);
    res.status(201).json(yield newChat.save());
})));
// مسار إضافة رسالة
router.post('/messages', (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newMessage = new Message_1.default(req.body);
    res.status(201).json(yield newMessage.save());
})));
// مسار إضافة منشور
router.post('/posts', (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newPost = new Post_1.default(req.body);
    res.status(201).json(yield newPost.save());
})));
// مسار البحث (بنحميه بـ protect عشان بس المسجلين في رابطة هما اللي يبحثوا)
router.get('/users/search/all', auth_middleware_1.protect, profile_controller_1.searchUsers);
// مسار عشان اليوزر يشوف بروفايل أي حد تاني (مش محتاج حماية أو ممكن تحميه حسب رغبتكم)
router.get('/users/:id', auth_middleware_1.protect, profile_controller_1.getUserProfile);
// المسارات الشخصية (لازم يكون عامل لوجين - نستخدم الميدل وير protect)
router.get('/profile/me', auth_middleware_1.protect, profile_controller_1.getMyProfile);
router.patch('/profile/me', auth_middleware_1.protect, profile_controller_1.updateMyProfile); // بنستخدم Patch لأننا بنحدث أجزاء معينة مش اليوزر كله
router.delete('/profile/me', auth_middleware_1.protect, profile_controller_1.deleteMyAccount);
// مسار رفع الصورة (الحارس -> مستلم الصور -> الكنترولر)
router.patch('/profile/me/avatar', auth_middleware_1.protect, upload_middleware_1.uploadAvatar.single('avatar'), profile_controller_2.uploadProfileAvatar);
exports.default = router;
