import { Router } from 'express';
import passport from 'passport';
import { login, register, googleAuthCallback } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/register', register);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }), 
  googleAuthCallback
);

export default router;