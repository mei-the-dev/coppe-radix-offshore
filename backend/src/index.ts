import dotenv from 'dotenv';
import { createApp } from './server';
import { runDeckAreaStartupCheck } from './db/ensure-deck-area';

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = createApp();

async function start() {
  await runDeckAreaStartupCheck();
  app.listen(PORT, () => {
    console.log(`🚢 PRIO Offshore Logistics API running on port ${PORT}`);
    console.log(`📊 Database connection ready`);
    console.log(`🌐 API available at http://localhost:${PORT}`);
    console.log(`📖 API Documentation: See references/prio_api_spec.md`);
  });
}

start();
