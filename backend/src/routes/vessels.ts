import { Router, Request, Response } from 'express';
import { mockVessels } from '../data/mockData';
import { Vessel } from '../types';

const router = Router();

// GET /api/vessels - Get all vessels
router.get('/', (req: Request, res: Response) => {
  res.json(mockVessels);
});

// GET /api/vessels/:id - Get vessel by ID
router.get('/:id', (req: Request, res: Response) => {
  const vessel = mockVessels.find(v => v.id === req.params.id);
  if (!vessel) {
    return res.status(404).json({ error: 'Vessel not found' });
  }
  res.json(vessel);
});

// PATCH /api/vessels/:id/status - Update vessel status
router.patch('/:id/status', (req: Request, res: Response) => {
  const vessel = mockVessels.find(v => v.id === req.params.id);
  if (!vessel) {
    return res.status(404).json({ error: 'Vessel not found' });
  }

  const { status, currentLocation, position } = req.body;
  if (status) vessel.status = status;
  if (currentLocation) vessel.currentLocation = currentLocation;
  if (position) vessel.position = position;

  res.json(vessel);
});

export default router;
