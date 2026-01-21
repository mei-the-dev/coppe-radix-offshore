import { Router, Request, Response } from 'express';
import { LoadingPlan, CargoItem } from '../types';
import { mockVessels, mockBerths } from '../data/mockData';
import { LoadingPlanService } from '../services/loadingPlanService';

const router = Router();

// In-memory storage for loading plans (will be replaced with database)
let loadingPlans: LoadingPlan[] = [];

const loadingPlanService = new LoadingPlanService();

// GET /api/loading-plans - Get all loading plans
router.get('/', (req: Request, res: Response) => {
  res.json(loadingPlans);
});

// GET /api/loading-plans/:id - Get loading plan by ID
router.get('/:id', (req: Request, res: Response) => {
  const plan = loadingPlans.find(p => p.id === req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Loading plan not found' });
  }
  res.json(plan);
});

// POST /api/loading-plans - Create new loading plan
router.post('/', (req: Request, res: Response) => {
  const { vesselId, berthId, scheduledStart, cargoItems } = req.body;

  // Validate vessel exists
  const vessel = mockVessels.find(v => v.id === vesselId);
  if (!vessel) {
    return res.status(400).json({ error: 'Vessel not found' });
  }

  // Validate berth exists
  const berth = mockBerths.find(b => b.id === berthId);
  if (!berth) {
    return res.status(400).json({ error: 'Berth not found' });
  }

  // Calculate estimated duration
  const estimatedDuration = loadingPlanService.calculateLoadingDuration(cargoItems);
  const scheduledEnd = new Date(new Date(scheduledStart).getTime() + estimatedDuration * 60 * 60 * 1000);

  // Validate plan
  const validationErrors = loadingPlanService.validateLoadingPlan(
    {
      id: '', // Will be set below
      vesselId,
      berthId,
      scheduledStart: new Date(scheduledStart),
      scheduledEnd,
      status: 'planned',
      cargoItems,
      estimatedDuration,
      loadingSequence: [],
      isValid: false,
    },
    vessel
  );

  // Suggest loading sequence
  const loadingSequence = loadingPlanService.suggestLoadingSequence(cargoItems);

  const plan: LoadingPlan = {
    id: `plan-${Date.now()}`,
    vesselId,
    berthId,
    scheduledStart: new Date(scheduledStart),
    scheduledEnd,
    status: 'planned',
    cargoItems,
    estimatedDuration,
    loadingSequence,
    isValid: validationErrors.length === 0,
    validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
  };

  loadingPlans.push(plan);
  res.status(201).json(plan);
});

// PATCH /api/loading-plans/:id - Update loading plan
router.patch('/:id', (req: Request, res: Response) => {
  const plan = loadingPlans.find(p => p.id === req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Loading plan not found' });
  }

  const updates = req.body;
  Object.assign(plan, updates);

  // Re-validate if cargo items changed
  if (updates.cargoItems) {
    const vessel = mockVessels.find(v => v.id === plan.vesselId);
    if (vessel) {
      const errors = loadingPlanService.validateLoadingPlan(plan, vessel);
      plan.isValid = errors.length === 0;
      plan.validationErrors = errors.length > 0 ? errors : undefined;
      plan.loadingSequence = loadingPlanService.suggestLoadingSequence(plan.cargoItems);
      plan.estimatedDuration = loadingPlanService.calculateLoadingDuration(plan.cargoItems);
    }
  }

  res.json(plan);
});

// DELETE /api/loading-plans/:id - Delete loading plan
router.delete('/:id', (req: Request, res: Response) => {
  const index = loadingPlans.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Loading plan not found' });
  }

  loadingPlans.splice(index, 1);
  res.status(204).send();
});

export default router;
