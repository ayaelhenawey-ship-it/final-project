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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const user_1 = require("../models/user");
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // ⚠️ تأكدي إن اللينك ده هو نفس اللي مكتوب في Google Cloud Console بالظبط
    callbackURL: '/api/v1/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // 1. هل المستخدم موجود بالفعل باستخدام الإيميل؟
        let user = yield user_1.User.findOne({ email: (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value });
        if (user) {
            // إذا كان موجوداً ولم يربط حساب جوجل من قبل، قم بربطه أوتوماتيكياً (تسهيلاً لليوزر)
            if (!user.googleId) {
                user.googleId = profile.id;
                yield user.save(); // ده هيشتغل عادي لأن اليوزر متسجل برقم تليفونه مسبقاً
            }
            // تسجيل دخول ناجح
            return done(null, user);
        }
        // 2. التعديل الجوهري: إذا لم يكن موجوداً، نرفض الطلب بدلاً من إنشاء حساب!
        // لا يمكننا إنشاء حساب بدون رقم هاتف، لذلك نعيد false (فشل تسجيل الدخول)
        return done(null, false, { message: 'This account is not registered with us. Please create an account with the phone number first.' });
    }
    catch (error) {
        done(error, undefined);
    }
})));
