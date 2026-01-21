import { Router, Request, Response } from 'express';
import { mockCargoCatalog, mockInstallations } from '../data/mockData';
import { CargoItem } from '../types';

const router = Router();

// GET /api/cargo/catalog - Get cargo catalog
router.get('/catalog', (req: Request, res: Response) => {
  res.json(mockCargoCatalog);
});

// GET /api/cargo/installations - Get installation destinations
router.get('/installations', (req: Request, res: Response) => {
  res.json(mockInstallations);
});

// POST /api/cargo/validate - Validate cargo compatibility
router.post('/validate', (req: Request, res: Response) => {
  const { cargoItems } = req.body;

  if (!Array.isArray(cargoItems)) {
    return res.status(400).json({ error: 'cargoItems must be an array' });
  }

  // Import here to avoid circular dependency
  const { CompatibilityService } = require('../services/compatibilityService');
  const service = new CompatibilityService();
  const errors = service.validateCargoItems(cargoItems);

  res.json({
    valid: errors.length === 0,
    errors,
  });
});

export default router;
