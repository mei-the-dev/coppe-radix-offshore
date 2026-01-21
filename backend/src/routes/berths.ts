import { Router, Request, Response } from 'express';
import { mockBerths } from '../data/mockData';
import { Berth } from '../types';

const router = Router();

// GET /api/berths - Get all berths
router.get('/', (req: Request, res: Response) => {
  res.json(mockBerths);
});

// GET /api/berths/:id - Get berth by ID
router.get('/:id', (req: Request, res: Response) => {
  const berth = mockBerths.find(b => b.id === req.params.id);
  if (!berth) {
    return res.status(404).json({ error: 'Berth not found' });
  }
  res.json(berth);
});

// GET /api/berths/available - Get available berths
router.get('/available', (req: Request, res: Response) => {
  const available = mockBerths.filter(b => b.status === 'available');
  res.json(available);
});

// PATCH /api/berths/:id/status - Update berth status
router.patch('/:id/status', (req: Request, res: Response) => {
  const berth = mockBerths.find(b => b.id === req.params.id);
  if (!berth) {
    return res.status(404).json({ error: 'Berth not found' });
  }

  const { status, currentVesselId, reservedUntil } = req.body;
  if (status) berth.status = status;
  if (currentVesselId !== undefined) berth.currentVesselId = currentVesselId;
  if (reservedUntil) berth.reservedUntil = new Date(reservedUntil);

  res.json(berth);
});

export default router;
