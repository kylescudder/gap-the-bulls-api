import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { findOrCreateGoogleUser } from '../services/authService';

// Serializing only the user.id
passport.serializeUser<number>((user, done) => {
  done(null, (user as any).id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await import('../database/connection').then(({ prisma }) =>
      prisma.user.findUnique({ where: { id } })
    );
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: '/auth/google/callback',
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (err: any, user?: Express.User) => void
    ) => {
      try {
        const emails = profile.emails?.map((e) => e.value) || [];
        const photo = profile.photos?.[0]?.value;

        const user = await findOrCreateGoogleUser({
          googleId: profile.id,
          displayName: profile.displayName,
          emails,
          photo,
        });

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

export default passport;
