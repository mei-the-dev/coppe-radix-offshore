/**
 * Standalone deck-area check for CI/deploy. Exit 1 if column missing or vessels exist but none populated.
 * Run: npm run check-deck-area
 */
import dotenv from 'dotenv';
import { runDeckAreaCheckStrict } from './ensure-deck-area';

dotenv.config();

runDeckAreaCheckStrict();
