import { Router } from 'express';
import diagramRouter from './diagram';

const router = Router();

router.use('/diagram', diagramRouter);

export default router;
