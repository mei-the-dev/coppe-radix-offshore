import dotenv from 'dotenv';
import { createApp } from './server';
import { runDeckAreaStartupCheck } from './db/ensure-deck-area';

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = createApp();

function start() {
  // Listen first so /health is available immediately; deployment health checks pass.
  app.listen(PORT, () => {
    console.log(`🚢 PRIO Offshore Logistics API running on port ${PORT}`);
    console.log(`🌐 API available at http://localhost:${PORT}`);
    console.log(`📖 API Documentation: See references/prio_api_spec.md`);
    // Run deck-area check after server is up; non-fatal so DB delay/errors don't block deploy.
    runDeckAreaStartupCheck({ fatal: false }).catch((err: unknown) => {
      console.error('Deck area startup check error:', err);
    });
  });
}

start();
