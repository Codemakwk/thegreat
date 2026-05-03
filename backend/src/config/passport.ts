import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './db';
import env from './env';
import { logToGoogleSheet } from '../utils/googleSheets';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
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
          // Create user if they don't exist
          const isAdmin = email === 'subramanim7603@gmail.com';
          const firstName = profile.name?.givenName || 'Google User';
          const lastName = profile.name?.familyName || '';
          
          user = await prisma.user.create({
            data: {
              email,
              firstName,
              lastName,
              password: '', // OAuth users don't have passwords
              role: isAdmin ? 'ADMIN' : 'CUSTOMER',
              emailVerified: true,
              avatar: profile.photos?.[0].value,
            },
          });

          // Log to Google Sheets
          logToGoogleSheet('registration', {
            userId: user.id,
            firstName,
            lastName,
            email,
            method: 'google',
          });
        } else {
          // Existing user logging in via Google
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

export default passport;
