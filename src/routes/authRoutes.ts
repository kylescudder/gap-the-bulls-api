import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';

const router = Router();

// Kick off the Google OAuth flow
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google will redirect here after approval
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/google/failure',
    session: true,
  }),
  (req: Request, res: Response) => {
    // On success, you have req.user
    // You can issue your own JWT here or set a cookie, etc.
    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: req.user,
    });
  }
);

router.get('/google/failure', (req: Request, res: Response) => {
  res.status(401).json({
    success: false,
    message: 'Google authentication failed',
  });
});

export default router;
