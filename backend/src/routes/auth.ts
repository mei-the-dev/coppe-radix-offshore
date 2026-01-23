import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/connection';
import { generateToken } from '../middleware/auth';

const router = Router();

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password, scope } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'Username and password are required'
      });
    }

    // Simple authentication for team sharing
    // Login: coppetec, Password: rotaviva
    const validCredentials = {
      username: 'coppetec',
      password: 'rotaviva'
    };

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
