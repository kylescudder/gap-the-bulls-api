import { User } from '@prisma/client';
import { prisma } from '../database/connection';

export interface GoogleProfileData {
  googleId: string;
  displayName: string;
  emails: string[];
  photo?: string;
}

/**
 * Finds a user by googleId or creates one.
 * Returns the full User record.
 */
export async function findOrCreateGoogleUser(
  profile: GoogleProfileData
): Promise<User> {
  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { googleId: profile.googleId },
  });

  if (!user) {
    // Create new user
    user = await prisma.user.create({
      data: {
        name: profile.displayName,
        googleId: profile.googleId,
        email: profile.emails[0], // store primary email
        avatarUrl: profile.photo,
      },
    });
  }

  return user;
}
