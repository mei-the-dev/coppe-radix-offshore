-- Add vessel deck area (clear deck area in m²) for existing databases
-- See references/inventory.md, prio-logistics-data-model, metrics_simple: Clear Deck Area per vessel class
-- Run: psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/add-vessel-deck-area.sql

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
