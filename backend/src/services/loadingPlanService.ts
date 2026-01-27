/**
 * Loading plan service: duration estimation and plan validation.
 * Used by loading-plans and optimization routes. Delegates compatibility checks to CompatibilityService.
 * @see references/inventory.md section 1.1 (operational times)
 */
import { LoadingPlan, CargoItem, Vessel } from '../types';
import { CompatibilityService } from './compatibilityService';
import { mockCargoCatalog } from '../data/mockData';

export class LoadingPlanService {
  private compatibilityService: CompatibilityService;

  constructor() {
    this.compatibilityService = new CompatibilityService();
  }

  /**
   * Calculate estimated loading duration based on cargo types and volumes
   * Based on inventory.md section 1.1 operational times
   */
  calculateLoadingDuration(cargoItems: CargoItem[]): number {
    let totalHours = 0;

    // Dock assignment time: 30-60 minutes (average 45 min = 0.75h)
    totalHours += 0.75;

    // Liquid cargo loading: 2-4 hours (depends on volume and number of products)
    const liquidCargo = cargoItems.filter(c => c.category === 'liquid_bulk');
    if (liquidCargo.length > 0) {
      const totalVolume = liquidCargo.reduce((sum, c) => sum + (c.volume || 0), 0);
      // Base time: 2h, +0.5h per 200m³, +0.5h per additional product type
      const volumeHours = Math.max(2, 2 + (totalVolume / 200) * 0.5);
      const productHours = (liquidCargo.length - 1) * 0.5;
      totalHours += volumeHours + productHours;
    }

    // Dry bulk loading: 1-3 hours
    const dryBulkCargo = cargoItems.filter(c => c.category === 'dry_bulk');
    if (dryBulkCargo.length > 0) {
      const totalVolume = dryBulkCargo.reduce((sum, c) => sum + (c.volume || 0), 0);
      // Base time: 1h, +0.5h per 100m³
      totalHours += Math.max(1, 1 + (totalVolume / 100) * 0.5);
    }

    // Deck cargo loading: 3-6 hours (depends on complexity)
    const deckCargo = cargoItems.filter(c => c.category === 'deck_cargo');
    if (deckCargo.length > 0) {
      const totalWeight = deckCargo.reduce((sum, c) => sum + (c.weight || 0), 0);
      // Base time: 3h, +0.5h per 50t, +0.5h per item type
      const weightHours = Math.max(3, 3 + (totalWeight / 50) * 0.5);
      const itemHours = (deckCargo.length - 1) * 0.5;
      totalHours += Math.min(6, weightHours + itemHours); // Cap at 6 hours
    }

    // Documentation time: 30-60 minutes (average 45 min = 0.75h)
    totalHours += 0.75;

    return Math.round(totalHours * 10) / 10; // Round to 1 decimal
  }

  /**
   * Validate loading plan against vessel capacity and constraints
   */
  validateLoadingPlan(plan: LoadingPlan, vessel: Vessel): string[] {
    const errors: string[] = [];

    // Check deck cargo capacity
    const deckCargo = plan.cargoItems.filter(c => c.category === 'deck_cargo');
    const totalDeckWeight = deckCargo.reduce((sum, c) => sum + (c.weight || 0), 0);
    if (totalDeckWeight > vessel.deckCargoCapacity) {
      errors.push(
        `Deck cargo exceeds capacity: ${totalDeckWeight}t > ${vessel.deckCargoCapacity}t`
      );
    }

    // Check liquid cargo capacity
    const liquidCargo = plan.cargoItems.filter(c => c.category === 'liquid_bulk');
    const totalLiquidVolume = liquidCargo.reduce((sum, c) => sum + (c.volume || 0), 0);
    if (totalLiquidVolume > vessel.liquidMudCapacity) {
      errors.push(
        `Liquid cargo exceeds capacity: ${totalLiquidVolume}m³ > ${vessel.liquidMudCapacity}m³`
      );
    }

    // Check dry bulk capacity
    const dryBulkCargo = plan.cargoItems.filter(c => c.category === 'dry_bulk');
    const totalDryBulkVolume = dryBulkCargo.reduce((sum, c) => sum + (c.volume || 0), 0);
    if (totalDryBulkVolume > vessel.dryBulkCapacity) {
      errors.push(
        `Dry bulk cargo exceeds capacity: ${totalDryBulkVolume}m³ > ${vessel.dryBulkCapacity}m³`
      );
    }

    // Check cargo compatibility
    const compatibilityErrors = this.compatibilityService.validateCargoItems(plan.cargoItems);
    errors.push(...compatibilityErrors);

    // Check total deadweight
    const totalWeight = totalDeckWeight + (totalLiquidVolume * 1.0) + (totalDryBulkVolume * 1.5);
    if (totalWeight > vessel.totalDeadweight) {
      errors.push(
        `Total cargo exceeds deadweight: ${totalWeight.toFixed(1)}t > ${vessel.totalDeadweight}t`
      );
    }

    return errors;
  }

  /**
   * Suggest optimal loading sequence
   * Based on inventory.md section 6.2: heavy items first, liquids for even keel
   */
  suggestLoadingSequence(cargoItems: CargoItem[]): string[] {
    // Sort by category and weight/volume
    const sorted = [...cargoItems].sort((a, b) => {
      // Deck cargo first (heaviest)
      if (a.category === 'deck_cargo' && b.category !== 'deck_cargo') return -1;
      if (b.category === 'deck_cargo' && a.category !== 'deck_cargo') return 1;

      // Within deck cargo, sort by weight (heaviest first)
      if (a.category === 'deck_cargo' && b.category === 'deck_cargo') {
        return (b.weight || 0) - (a.weight || 0);
      }

      // Liquid cargo next
      if (a.category === 'liquid_bulk' && b.category !== 'liquid_bulk') return -1;
      if (b.category === 'liquid_bulk' && a.category !== 'liquid_bulk') return 1;

      // Dry bulk last
      return 0;
    });

    return sorted.map(c => c.id);
  }
}
