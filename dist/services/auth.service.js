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
exports.registerUser = exports.loginUser = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../models/user");
const AppError_1 = require("../utils/AppError");
const signToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRES_IN || '90d') });
};
exports.signToken = signToken;
const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email || !password)
        throw new AppError_1.AppError('Please enter the data', 400);
    const user = yield user_1.User.findOne({ email }).select('+password');
    if (!user || !(yield user.comparePassword(password, user.password))) {
        throw new AppError_1.AppError('The data is incorrect', 401);
    }
    const token = (0, exports.signToken)(user._id.toString());
    user.password = undefined;
    return { user, token };
});
exports.loginUser = loginUser;
const registerUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield user_1.User.findOne({ email: userData.email });
    if (existingUser)
        throw new AppError_1.AppError('The user already exists', 400);
    const newUser = yield user_1.User.create(userData);
    const token = (0, exports.signToken)(newUser._id.toString());
    newUser.password = undefined;
    return { user: newUser, token };
});
exports.registerUser = registerUser;
