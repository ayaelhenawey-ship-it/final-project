"use strict";
// src/routes/authRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post('/login', auth_controller_1.login);
router.post('/register', auth_controller_1.register);
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'], session: false }));
// ✅ التعديل النهائي الجاهز للفرونت إند
router.get('/google/callback', passport_1.default.authenticate('google', {
    session: false,
    // لو الإيميل مش متسجل، هنحدفه لصفحة اللوجين في الفرونت إند ونقوله السبب في اللينك
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=not_registered`
}), auth_controller_1.googleAuthCallback);
exports.default = router;
