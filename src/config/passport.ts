import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. هل المستخدم موجود بالفعل باستخدام الإيميل؟
        let user = await User.findOne({ email: profile.emails?.[0].value });

        if (user) {
          // إذا كان موجوداً ولم يربط حساب جوجل من قبل، قم بربطه
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // 2. إذا لم يكن موجوداً، قم بإنشاء حساب جديد
        user = await User.create({
          fullName: profile.displayName,
          email: profile.emails?.[0].value,
          googleId: profile.id,
          role: 'student', // الدور الافتراضي
          status: 'online',
        });

        done(null, user);
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);