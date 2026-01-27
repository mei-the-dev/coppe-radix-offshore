/**
 * Ensures vessels.clear_deck_area_m2 exists and is populated.
 * Runs on backend start so deploy works without manual migration.
 * Set SKIP_DECK_AREA_CHECK=1 to skip (e.g. for workers that don't use vessels).
 */
import pool from './connection';

const COLUMN_CHECK_SQL = `
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'vessels' AND column_name = 'clear_deck_area_m2'
`;

const ADD_COLUMN_SQL = `
  ALTER TABLE vessels ADD COLUMN IF NOT EXISTS clear_deck_area_m2 DECIMAL(10,2)
`;

const POPULATION_CHECK_SQL = `
  SELECT
    (SELECT COUNT(*) FROM vessels) AS total,
    (SELECT COUNT(*) FROM vessels WHERE clear_deck_area_m2 IS NOT NULL AND clear_deck_area_m2 > 0) AS populated
`;

export interface DeckAreaCheckResult {
  columnExists: boolean;
  columnAdded: boolean;
  vesselCount: number;
  populatedCount: number;
  ok: boolean;
  message: string;
}

export async function ensureDeckArea(): Promise<DeckAreaCheckResult> {
  const result: DeckAreaCheckResult = {
    columnExists: false,
    columnAdded: false,
    vesselCount: 0,
    populatedCount: 0,
    ok: true,
    message: '',
  };

  const client = await pool.connect();
  try {
    // 1) Column exists?
    const col = await client.query(COLUMN_CHECK_SQL);
    result.columnExists = (col.rows?.[0] != null);

    if (!result.columnExists) {
      try {
        await client.query(ADD_COLUMN_SQL);
        result.columnAdded = true;
        result.columnExists = true;
      } catch (err: any) {
        const msg = String(err?.message || err);
        if (/relation "vessels" does not exist/i.test(msg)) {
          result.message = 'Vessels table not found; run migrate first. Deck area check skipped.';
          return result;
        }
        result.ok = false;
        result.message = `Could not add vessels.clear_deck_area_m2: ${msg}`;
        return result;
      }
    }

    // 2) Population check (vessels table might be empty in fresh deploy)
    try {
      const pop = await client.query(POPULATION_CHECK_SQL);
      const row = pop.rows?.[0];
      result.vesselCount = parseInt(String(row?.total ?? 0), 10) || 0;
      result.populatedCount = parseInt(String(row?.populated ?? 0), 10) || 0;

      if (result.vesselCount > 0 && result.populatedCount === 0) {
        result.message =
          'vessels.clear_deck_area_m2 exists but is empty. Run: npm run seed (or add-deck-area then seed).';
        // Still ok so deploy can succeed; API will return null for deck area
      } else if (result.columnAdded) {
        result.message = 'Added vessels.clear_deck_area_m2. Run npm run seed to fill values.';
      }
    } catch (_) {
      // Table might not exist yet; avoid failing start
      result.message = 'Vessels table not ready; deck area check skipped.';
    }

  } finally {
    client.release();
  }

  return result;
}

export interface DeckAreaStartupOptions {
  /** If false, never process.exit(1); log and return. Use at server startup so deploy health checks pass. */
  fatal?: boolean;
}

export async function runDeckAreaStartupCheck(options: DeckAreaStartupOptions = {}): Promise<void> {
  const { fatal = true } = options;

  if (process.env.SKIP_DECK_AREA_CHECK === '1') {
    console.log('⏭️  Deck area check skipped (SKIP_DECK_AREA_CHECK=1)');
    return;
  }

  try {
    const r = await ensureDeckArea();
    if (!r.ok) {
      console.error('❌ Deck area startup check failed:', r.message);
      if (fatal) process.exit(1);
      return;
    }
    if (r.columnAdded) {
      console.log('📏 Deck area: column added on start. Run "npm run seed" to populate.');
    } else if (r.message) {
      console.warn('⚠️  Deck area:', r.message);
    } else if (r.vesselCount > 0 && r.populatedCount > 0) {
      console.log(`📏 Deck area: column present, ${r.populatedCount}/${r.vesselCount} vessels populated.`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ Deck area startup check error:', msg);
    if (fatal) process.exit(1);
  }
}

/**
 * Standalone check for CI/deploy: exit 1 if column missing or vessels exist but none have deck area.
 * Run: npm run check-deck-area
 */
export async function runDeckAreaCheckStrict(): Promise<void> {
  try {
    const r = await ensureDeckArea();
    if (!r.ok) {
      console.error('❌ Deck area check failed:', r.message);
      process.exit(1);
    }
    if (r.vesselCount > 0 && r.populatedCount === 0) {
      console.error('❌ Deck area check failed: vessels exist but clear_deck_area_m2 is empty. Run npm run seed.');
      process.exit(1);
    }
    console.log(`✅ Deck area: column present, ${r.populatedCount}/${r.vesselCount} vessels populated.`);
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Deck area check error:', err?.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}
