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

    // In a real application, you would query the database for the user
    // For now, we'll use a simple mock authentication
    // TODO: Implement proper user authentication with database

    // Mock user lookup (replace with actual database query)
    const mockUser = {
      id: 'user_123',
      name: 'John Operator',
      role: 'logistics_coordinator',
      username: 'operator@prio.com',
      password: '$2a$10$mockhashedpassword' // In production, hash passwords properly
    };

    // For demo purposes, accept any password for operator@prio.com
    // In production, verify password with bcrypt.compare
    if (username !== mockUser.username) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const accessToken = generateToken({
      id: mockUser.id,
      name: mockUser.name,
      role: mockUser.role
    });

    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: 'refresh_token_string', // TODO: Implement refresh tokens
      user: {
        id: mockUser.id,
        name: mockUser.name,
        role: mockUser.role
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
