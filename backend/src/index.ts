import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Legacy routes (for backward compatibility)
import vesselsRouter from './routes/vessels';
import berthsRouter from './routes/berths';
import cargoRouter from './routes/cargo';
import loadingPlansRouter from './routes/loadingPlans';
import simulationRouter from './routes/simulation';

// PRIO API routes
import authRouter from './routes/auth';
import installationsRouter from './routes/installations';
import distancesRouter from './routes/distances';
import fleetVesselsRouter from './routes/fleet/vessels';
import cargoTypesRouter from './routes/cargo/types';
import demandsRouter from './routes/cargo/demands';
import ordersRouter from './routes/cargo/orders';
import tripsRouter from './routes/trips';
import timeWindowsRouter from './routes/operations/timeWindows';
import weatherRouter from './routes/weather';
import optimizationRouter from './routes/optimization';
import analyticsRouter from './routes/analytics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS configuration
// Allow all origins for now to fix mobile access issues
// Can be restricted later for security
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Legacy API Routes (for backward compatibility)
app.use('/api/vessels', vesselsRouter);
app.use('/api/berths', berthsRouter);
app.use('/api/cargo', cargoRouter);
app.use('/api/loading-plans', loadingPlansRouter);
app.use('/api/simulation', simulationRouter);

// PRIO API Routes (v1)
// Authentication
app.use('/auth', authRouter);

// Network Management
app.use('/installations', installationsRouter);
app.use('/network/distances', distancesRouter);

// Fleet Management
app.use('/fleet/vessels', fleetVesselsRouter);

// Cargo & Inventory
app.use('/cargo/types', cargoTypesRouter);
app.use('/demands', demandsRouter);
app.use('/orders', ordersRouter);

// Operations & Trips
app.use('/trips', tripsRouter);
app.use('/operations/time-windows', timeWindowsRouter);

// Weather & Environment
app.use('/weather', weatherRouter);

// Optimization
app.use('/optimization', optimizationRouter);

// Analytics & Reporting
app.use('/analytics', analyticsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚢 PRIO Offshore Logistics API running on port ${PORT}`);
  console.log(`📊 Database connection ready`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
  console.log(`📖 API Documentation: See references/prio_api_spec.md`);
});
