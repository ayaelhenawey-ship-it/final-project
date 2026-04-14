"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: { type: String, required: true, unique: true },
    googleId: { type: String, unique: true, sparse: true }, // حقل اختياري للربط
    password: { type: String, required: true, select: false },
    role: {
        type: String,
        enum: ['student', 'freelancer', 'employer'],
        default: 'student',
        required: true
    },
    trackName: { type: String },
    skills: [{ type: String }],
    portfolioLinks: [{ type: String }],
    companyName: { type: String },
    bio: { type: String, default: "" },
    status: {
        type: String,
        enum: ['online', 'offline', 'busy'],
        default: 'offline'
    },
    avatar: { type: String, default: "" }
}, { timestamps: true });
// يعني إيه index: الـ Index زي الفهرس في الكتاب، بيخلي الداتا بيز توصل للمعلومة بسرعة بدل ما تدور في كل السجلات.
// ليه بنستخدمه: عشان نسرع عملية البحث، بالذات على الحقول اللي بنستخدمها كتير في الفلتر زي الاسم والمهارات ومسار الكورس.
// ليه مش بنعمل index لكل حاجة: لأن كل Index بياخد مساحة تخزين وبيبطئ عمليات الإضافة والتعديل (Write cost)، فلازم نوازن ما بين الـ read performance ومابين التكلفة.
UserSchema.index({ fullName: 1 });
UserSchema.index({ skills: 1 });
UserSchema.index({ trackName: 1 });
UserSchema.pre('save', function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password') || !this.password)
            return;
        this.password = yield bcryptjs_1.default.hash(this.password, 12);
    });
});
UserSchema.methods.comparePassword = function (candidatePassword, userPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(candidatePassword, userPassword);
    });
};
exports.User = mongoose_1.default.model('User', UserSchema);
