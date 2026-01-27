/**
 * Auth routes: login, token validation.
 * Demo credentials come from env (AUTH_DEMO_USER, AUTH_DEMO_PASSWORD) in production.
 */
import { Router, Request, Response } from 'express';
import { generateToken } from '../middleware/auth';

const router = Router();

const getDemoCredentials = () => ({
  username: process.env.AUTH_DEMO_USER || 'coppetec',
  password: process.env.AUTH_DEMO_PASSWORD || 'rotaviva',
});

// POST /auth/login — respond immediately; avoid any chance of hanging.
router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = req.body != null && typeof req.body === 'object' ? req.body : {};
    const username = body.username;
    const password = body.password;

    if (!username || !password) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'Username and password are required'
      });
    }

    const validCredentials = getDemoCredentials();
    if (process.env.NODE_ENV === 'production' && (!process.env.AUTH_DEMO_USER || !process.env.AUTH_DEMO_PASSWORD)) {
      return res.status(503).json({
        error: 'config_error',
        message: 'Auth demo user not configured; set AUTH_DEMO_USER and AUTH_DEMO_PASSWORD',
      });
    }

    if (username !== validCredentials.username || password !== validCredentials.password) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'Invalid credentials'
      });
    }

    // User data for authenticated user
    const user = {
      id: 'coppetec_user',
      name: 'COPPETEC Team',
      role: 'logistics_coordinator'
    };

    // Generate tokens
    const accessToken = generateToken({
      id: user.id,
      name: user.name,
      role: user.role
    });

    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: 'refresh_token_string', // TODO: Implement refresh tokens
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      request_id: `req_${Date.now()}`
    });
  }
});

export default router;
