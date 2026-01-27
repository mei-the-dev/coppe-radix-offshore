import type { Express } from 'express';

import vesselsRouter from './vessels';
import berthsRouter from './berths';
import cargoRouter from './cargo';
import loadingPlansRouter from './loadingPlans';
import simulationRouter from './simulation';
import authRouter from './auth';
import installationsRouter from './installations';
import distancesRouter from './distances';
import supplyBasesRouter from './supplyBases';
import fleetVesselsRouter from './fleet/vessels';
import cargoTypesRouter from './cargo/types';
import demandsRouter from './cargo/demands';
import ordersRouter from './cargo/orders';
import tripsRouter from './trips';
import timeWindowsRouter from './operations/timeWindows';
import weatherRouter from './weather';
import optimizationRouter from './optimization';
import analyticsRouter from './analytics';

/** Mount all API routes onto the Express app. */
export function mountRoutes(app: Express): void {
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  app.get('/', (_req, res) => {
    res.json({ status: 'ok', message: 'PRIO Offshore Logistics API' });
  });

  app.use('/api/vessels', vesselsRouter);
  app.use('/api/berths', berthsRouter);
  app.use('/api/cargo', cargoRouter);
  app.use('/api/loading-plans', loadingPlansRouter);
  app.use('/api/simulation', simulationRouter);

  app.use('/auth', authRouter);
  app.use('/installations', installationsRouter);
  app.use('/network/distances', distancesRouter);
  app.use('/supply-bases', supplyBasesRouter);
  app.use('/fleet/vessels', fleetVesselsRouter);
  app.use('/cargo/types', cargoTypesRouter);
  app.use('/demands', demandsRouter);
  app.use('/orders', ordersRouter);
  app.use('/trips', tripsRouter);
  app.use('/operations/time-windows', timeWindowsRouter);
  app.use('/weather', weatherRouter);
  app.use('/optimization', optimizationRouter);
  app.use('/analytics', analyticsRouter);
}
