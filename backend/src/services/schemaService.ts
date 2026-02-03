import { promises as fs } from 'fs';
import path from 'path';

const DOT_PATH = path.join(__dirname, '../../../references/prio_database_diagram_detailed_minimal.dot');

export class SchemaService {
  private cachedDot?: string;
  private cachedAt?: number;

  async getDotSource(): Promise<string> {
    if (!this.cachedDot || !this.cachedAt || Date.now() - this.cachedAt > 5 * 60 * 1000) {
      this.cachedDot = await fs.readFile(DOT_PATH, 'utf-8');
      this.cachedAt = Date.now();
    }
    return this.cachedDot;
  }
}

export const schemaService = new SchemaService();
