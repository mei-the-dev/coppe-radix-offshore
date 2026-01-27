/**
 * Add vessels.clear_deck_area_m2 for existing DBs (see scripts/add-vessel-deck-area.sql).
 * Run: npm run add-deck-area
 */
import dotenv from 'dotenv';
import pool from './connection';

dotenv.config();

const SQL = `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vessels' AND column_name = 'clear_deck_area_m2'
  ) THEN
    ALTER TABLE vessels ADD COLUMN clear_deck_area_m2 DECIMAL(10,2);
    RAISE NOTICE 'Added column vessels.clear_deck_area_m2';
  ELSE
    RAISE NOTICE 'Column vessels.clear_deck_area_m2 already exists';
  END IF;
END $$;
`;

async function run() {
  try {
    await pool.query(SQL);
    console.log('✅ Deck area migration applied. Run "npm run seed" to populate values.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Deck area migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
