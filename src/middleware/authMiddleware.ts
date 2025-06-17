import { Request, Response, NextFunction } from 'express';

/**
 * If the user is not authenticated (i.e. not logged in via Passport+session),
 * respond with 401. Otherwise, call next().
 */
export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    success: false,
    error: 'Unauthorized – please log in via Google OAuth',
  });
}
