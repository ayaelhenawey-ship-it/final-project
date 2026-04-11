// src/routes/authRoutes.ts

import { Router } from 'express';
import passport from 'passport';
import { login, register, googleAuthCallback } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/register', register);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// ✅ التعديل النهائي الجاهز للفرونت إند
router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false, 
    // لو الإيميل مش متسجل، هنحدفه لصفحة اللوجين في الفرونت إند ونقوله السبب في اللينك
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=not_registered` 
  }), 
  googleAuthCallback
);

export default router;