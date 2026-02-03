import { Router, Request, Response } from 'express';
import { dataOverviewService } from '../../services/dataOverviewService';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const overview = await dataOverviewService.getOverview();
    res.json(overview);
  } catch (error) {
    console.error('Failed to load data overview', error);
    res.status(500).json({
      error: 'data_overview_unavailable',
      message: 'Unable to load data overview',
    });
  }
});

export default router;