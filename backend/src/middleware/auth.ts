import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    role: string;
  };
}

/** Emergency fallback when JWT_SECRET is not set. Replace with a real secret in App Platform env vars as soon as possible. */
const EMERGENCY_JWT_FALLBACK = 'emergency-deploy-fallback-change-in-app-platform-32chars';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === 'production') {
    console.warn('JWT_SECRET not set; using temporary fallback. Set JWT_SECRET in App Platform env vars.');
    return EMERGENCY_JWT_FALLBACK;
  }
  return secret || 'dev-only-secret-not-for-production';
}

const JWT_SECRET = getJwtSecret();

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'No token provided'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'unauthorized',
        message: 'Invalid or expired token'
      });
    }
    req.user = user as { id: string; name: string; role: string };
    next();
  });
};

export const generateToken = (user: { id: string; name: string; role: string }) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
};
