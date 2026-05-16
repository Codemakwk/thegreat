import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './db';
import env from './env';
import { logToGoogleSheet } from '../utils/googleSheets';

// Only register Google OAuth if credentials are configured
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${env.NODE_ENV === 'production' ? 'https://thegreat-uf6z.onrender.com' : 'http://localhost:3001'}/api/v1/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let email = profile.emails?.[0].value;
          if (!email) {
            return done(new Error('No email found from Google profile'), undefined);
          }
          email = email.toLowerCase();

          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            const isAdmin = email === 'subramanim7603@gmail.com';
            const firstName = profile.name?.givenName || 'Google User';
            const lastName = profile.name?.familyName || '';

            user = await prisma.user.create({
              data: {
                email,
                firstName,
                lastName,
                password: '',
                role: isAdmin ? 'ADMIN' : 'CUSTOMER',
                emailVerified: true,
                avatar: profile.photos?.[0].value,
              },
            });

            logToGoogleSheet('registration', {
              userId: user.id,
              firstName,
              lastName,
              email,
              method: 'google',
            });
          } else {
            logToGoogleSheet('login', {
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              method: 'google',
              status: 'success',
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
} else {
  console.warn('⚠️  Google OAuth disabled — GOOGLE_CLIENT_ID not set in .env');
}

export default passport;
