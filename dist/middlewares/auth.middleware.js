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
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// 👈 ضفنا الـ IUser هنا في الاستيراد
const user_1 = require("../models/user");
const AppError_1 = require("../utils/AppError");
const catchAsync_1 = require("../utils/catchAsync");
exports.protect = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    // 1. Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError_1.AppError('You are not logged in! Please log in to get access.', 401));
    }
    // 2. Verify token
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    // 3. Check if user still exists
    const currentUser = yield user_1.User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError_1.AppError('The user belonging to this token does no longer exist.', 401));
    }
    // 4. Grant access to protected route
    req.user = currentUser;
    next();
}));
