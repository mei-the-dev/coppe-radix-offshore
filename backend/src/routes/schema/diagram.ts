import { Router, Request, Response } from 'express';
import { schemaService } from '../../services/schemaService';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const diagram = await schemaService.getDotSource();
    res.setHeader('Content-Type', 'text/vnd.graphviz');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(diagram);
  } catch (error) {
    console.error('Failed to load schema diagram', error);
    res.status(500).json({ error: 'diagram_unavailable', message: 'Unable to load database diagram' });
  }
});

export default router;
