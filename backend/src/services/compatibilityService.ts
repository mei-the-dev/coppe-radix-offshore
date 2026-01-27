/**
 * Cargo compatibility validation (inventory.md section 3.3).
 * Checks cargo-type pairs and tank-cleaning requirements; used by LoadingPlanService and cargo routes.
 */
import { CargoCompatibilityRule, CargoItem } from '../types';
import { mockCompatibilityRules } from '../data/mockData';

export interface CompatibilityCheck {
  compatible: boolean;
  cleaningTimeHours?: number;
  reason?: string;
}

export class CompatibilityService {
  private rules: CargoCompatibilityRule[];

  constructor(rules: CargoCompatibilityRule[] = mockCompatibilityRules) {
    this.rules = rules;
  }

  /**
   * Check if two cargo types are compatible
   */
  checkCompatibility(fromCargo: string, toCargo: string): CompatibilityCheck {
    // Same cargo type is always compatible
    if (fromCargo === toCargo) {
      return { compatible: true };
    }

    // Find rule for this combination
    const rule = this.rules.find(
      r => r.fromCargo === fromCargo && r.toCargo === toCargo
    );

    if (!rule) {
      // If no rule found, check reverse direction
      const reverseRule = this.rules.find(
        r => r.fromCargo === toCargo && r.toCargo === fromCargo
      );

      if (reverseRule) {
        return {
          compatible: reverseRule.compatible,
          cleaningTimeHours: reverseRule.cleaningTimeHours,
          reason: reverseRule.compatible
            ? undefined
            : `Requires ${reverseRule.cleaningTimeHours}h tank cleaning`,
        };
      }

      // Default: assume compatible if no rule exists
      return { compatible: true };
    }

    return {
      compatible: rule.compatible,
      cleaningTimeHours: rule.cleaningTimeHours,
      reason: rule.compatible
        ? undefined
        : `Requires ${rule.cleaningTimeHours}h tank cleaning`,
    };
  }

  /**
   * Validate cargo items for a vessel
   * Returns validation errors if any
   */
  validateCargoItems(cargoItems: CargoItem[]): string[] {
    const errors: string[] = [];
    const liquidCargo = cargoItems.filter(c => c.category === 'liquid_bulk');

    // Check compatibility between all liquid cargo pairs
    for (let i = 0; i < liquidCargo.length; i++) {
      for (let j = i + 1; j < liquidCargo.length; j++) {
        const cargo1 = liquidCargo[i];
        const cargo2 = liquidCargo[j];

        const check = this.checkCompatibility(cargo1.type, cargo2.type);

        if (!check.compatible) {
          errors.push(
            `Incompatible cargo: ${cargo1.name} and ${cargo2.name}. ${check.reason}`
          );
        }
      }
    }

    return errors;
  }

  /**
   * Get required cleaning time between cargo sequences
   */
  getCleaningTime(previousCargo: string, nextCargo: string): number {
    const check = this.checkCompatibility(previousCargo, nextCargo);
    return check.cleaningTimeHours || 0;
  }
}
