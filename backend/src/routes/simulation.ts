import { Router, Request, Response } from 'express';
import { platforms, macaePort } from '../data/platformCoordinates';
import { mockVessels } from '../data/mockData';

const router = Router();

// GET /api/simulation/platforms - Get all platforms with coordinates
router.get('/platforms', (req: Request, res: Response) => {
  res.json({ port: macaePort, platforms });
});

// GET /api/simulation/vessels - Get vessels for simulation
router.get('/vessels', (req: Request, res: Response) => {
  res.json(mockVessels);
});

export default router;
