"use strict";
// hello test yassa
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // 👈 تعديل زميلتك عشان المتغيرات تتقري بدري
// 👇 أضفنا السطرين دول مؤقتاً عشان نكشف بيهم على المتغيرات
console.log("👀 GOOGLE_CLIENT_ID IS:", process.env.GOOGLE_CLIENT_ID);
console.log("👀 GOOGLE_CLIENT_SECRET IS:", process.env.GOOGLE_CLIENT_SECRET);
// ---------------------------------------------------------
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// 1. استيراد إعدادات Passport (من شغل زميلتك)
const passport_1 = __importDefault(require("passport"));
require("./config/passport");
// 2. استيراد المسارات (دمج الشغلين)
const authRoutes_1 = __importDefault(require("./routes/authRoutes")); // مسارات زميلتك
const routes_1 = __importDefault(require("./routes")); // مساراتك النظيفة المجمعة
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const BASE_URL = '/api/v1';
// ==========================================
// 🛡️ إعدادات الحماية (Rate Limiting)
// ==========================================
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100, // أقصى عدد طلبات لكل يوزر
    message: {
        message: "The allowed request limit has been exceeded, please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(BASE_URL, apiLimiter);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ==========================================
// 🔑 تهيئة المصادقة عبر Passport (من شغل زميلتك)
// ==========================================
app.use(passport_1.default.initialize());
// ==========================================
// 🗄️ الاتصال بقاعدة البيانات
// ==========================================
mongoose_1.default.connect(process.env.MONGO_URI)
    .then(() => {
    console.log('✅ MongoDB Connected');
    console.log('📂 Writing to Database:', mongoose_1.default.connection.name);
})
    .catch(err => console.log('❌ Database Connection Error:', err));
// ==========================================
// 🚀 ربط المسارات بالسيرفر
// ==========================================
// مسار تجريبي
app.get('/test', (req, res) => {
    res.send('Server is running');
});
// مسارات المصادقة الخاصة بزميلتك (Login, Register, Google Auth)
app.use(`${BASE_URL}/auth`, authRoutes_1.default);
// باقي المسارات بتاعتك النظيفة (Jobs, Chats, Posts, Link-Google)
app.use(BASE_URL, routes_1.default);
// ==========================================
// 🚨 حراس معالجة الأخطاء (Global Error Handlers)
// ==========================================
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
// ==========================================
// 🌐 تشغيل السيرفر
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Base URL is ready at: http://localhost:${PORT}${BASE_URL}`);
});
