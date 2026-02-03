import { query } from '../db/connection';
import {
  DataOverviewResponse,
  Vessel,
  Berth,
  CargoCatalogDefinition,
  CargoCompatibilityRule,
  InstallationSummary,
  VesselType,
} from '../types';
import {
  mockVessels,
  mockBerths,
  mockCargoCatalog,
  mockCompatibilityRules,
  mockInstallations,
} from '../data/mockData';

const PORTO_DO_ACU = 'Porto do Açu' as const;

const vesselClassMap: Record<string, VesselType> = {
  StandardPSV: 'Standard PSV',
  LargePSV: 'Large PSV',
  CSV: 'CSV',
  WellStimulation: 'Well Stimulation',
};

const dpClassMap: Record<string, Vessel['dpClass']> = {
  DP1: 'DP-1',
  DP2: 'DP-2',
  DP3: 'DP-3',
  None: 'None',
};

const vesselStatusMap: Record<string, Vessel['status']> = {
  Available: 'available',
  InUse: 'in_transit',
  Maintenance: 'maintenance',
  Drydock: 'maintenance',
};

const installationTypeMap: Record<string, string> = {
  FPSO: 'FPSO',
  FixedPlatform: 'Fixed Platform',
  WellheadPlatform: 'Wellhead Platform',
};

const cargoCategoryMap: Record<string, CargoCatalogDefinition['category']> = {
  Liquid: 'liquid_bulk',
  DryBulk: 'dry_bulk',
  DeckCargo: 'deck_cargo',
};

type VesselRow = {
  id: string;
  name: string;
  class: string;
  loa_m: string | number | null;
  beam_m: string | number | null;
  draught_m: string | number | null;
  deck_cargo_capacity_t: string | number | null;
  clear_deck_area_m2: string | number | null;
  total_deadweight_t: string | number | null;
  service_speed_kts: string | number | null;
  operational_speed_kts: string | number | null;
  dp_class: string;
  availability_status: string;
  current_location_name: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
};

type InstallationRow = {
  id: string;
  name: string;
  type: string;
  distance_from_base_nm: string | number | null;
};

type CargoRow = {
  id: string;
  name: string;
  category: string;
  density_kg_m3: string | number | null;
  segregation_required: boolean;
};

type CompatibilityRow = {
  cargo_type_id_1: string;
  cargo_type_id_2: string;
  cleaning_time_h: string | number;
};

type SupplyBaseRow = {
  id: string;
  name: string;
  max_draught_m: string | number | null;
  max_vessel_length_m: string | number | null;
  max_deadweight_t: string | number | null;
  num_berths: string | number | null;
};

function countBy<T extends Record<string, any>>(items: T[], key: keyof T): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = String(item[key] ?? 'unknown');
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

const toNumber = (value: string | number | null | undefined, fallback = 0): number => {
  if (value === null || value === undefined) {
    return fallback;
  }
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
};

export class DataOverviewService {
  async getOverview(): Promise<DataOverviewResponse> {
    if (process.env.DATA_OVERVIEW_USE_MOCK === 'true') {
      return this.buildMockResponse();
    }

    try {
      return await this.buildDatabaseResponse();
    } catch (error) {
      console.error('Falling back to mock data for data overview:', error);
      return this.buildMockResponse();
    }
  }

  private async buildDatabaseResponse(): Promise<DataOverviewResponse> {
    const [vesselResult, installationResult, cargoResult, compatibilityResult, supplyBaseResult] = await Promise.all([
      query(
        `
          SELECT
            v.id,
            v.name,
            v.class,
            v.loa_m,
            v.beam_m,
            v.draught_m,
            v.deck_cargo_capacity_t,
            v.clear_deck_area_m2,
            v.total_deadweight_t,
            v.service_speed_kts,
            v.operational_speed_kts,
            v.dp_class,
            v.availability_status,
            COALESCE(sb.name, inst.name, v.current_location_id) AS current_location_name,
            ST_Y(v.current_location_coords::geometry) AS latitude,
            ST_X(v.current_location_coords::geometry) AS longitude
          FROM vessels v
          LEFT JOIN supply_bases sb ON sb.id = v.current_location_id
          LEFT JOIN installations inst ON inst.id = v.current_location_id
          ORDER BY v.name ASC
        `
      ),
      query(
        `
          SELECT id, name, type, distance_from_base_nm
          FROM installations
          ORDER BY name ASC
        `
      ),
      query(
        `
          SELECT id, name, category, density_kg_m3, segregation_required
          FROM cargo_types
          ORDER BY category ASC, name ASC
        `
      ),
      query(
        `
          SELECT cargo_type_id_1, cargo_type_id_2, cleaning_time_h
          FROM cargo_incompatibility
          ORDER BY cargo_type_id_1 ASC, cargo_type_id_2 ASC
        `
      ),
      query(
        `
          SELECT id, name, max_draught_m, max_vessel_length_m, max_deadweight_t, num_berths
          FROM supply_bases
          ORDER BY name ASC
        `
      ),
    ]);

    const vessels = (vesselResult.rows as VesselRow[]).map((row) => this.mapVesselRow(row));
    const installations = (installationResult.rows as InstallationRow[]).map((row) => this.mapInstallationRow(row));
    const { compatibilityRules, incompatibleMap } = this.mapCompatibilityRows(compatibilityResult.rows as CompatibilityRow[]);
    const cargoCatalog = (cargoResult.rows as CargoRow[]).map((row) => this.mapCargoRow(row, incompatibleMap));
    const berths = this.buildBerths(supplyBaseResult.rows as SupplyBaseRow[], vessels);
    const breakdowns = this.buildBreakdowns(vessels, installations, cargoCatalog);

    return {
      updatedAt: new Date().toISOString(),
      counts: {
        vessels: vessels.length,
        installations: installations.length,
        cargoTypes: cargoCatalog.length,
        berths: berths.length,
      },
      vessels,
      installations,
      cargoCatalog,
      berths,
      compatibilityRules,
      breakdowns,
    };
  }

  private buildMockResponse(): DataOverviewResponse {
    const breakdowns = this.buildBreakdowns(mockVessels, mockInstallations, mockCargoCatalog);

    return {
      updatedAt: new Date().toISOString(),
      counts: {
        vessels: mockVessels.length,
        installations: mockInstallations.length,
        cargoTypes: mockCargoCatalog.length,
        berths: mockBerths.length,
      },
      vessels: mockVessels,
      installations: mockInstallations,
      cargoCatalog: mockCargoCatalog,
      berths: mockBerths,
      compatibilityRules: mockCompatibilityRules,
      breakdowns,
    };
  }

  private mapVesselRow(row: VesselRow): Vessel {
    const type = vesselClassMap[row.class] ?? 'Standard PSV';
    const dpClass = dpClassMap[row.dp_class] ?? 'None';
    const status = vesselStatusMap[row.availability_status] ?? 'in_port';

    const position =
      row.latitude !== null && row.latitude !== undefined && row.longitude !== null && row.longitude !== undefined
        ? { lat: toNumber(row.latitude), lon: toNumber(row.longitude) }
        : undefined;

    return {
      id: row.id,
      name: row.name,
      type,
      lengthOverall: toNumber(row.loa_m),
      beam: toNumber(row.beam_m),
      draughtLoaded: toNumber(row.draught_m),
      deckCargoCapacity: toNumber(row.deck_cargo_capacity_t),
      clearDeckArea: toNumber(row.clear_deck_area_m2),
      totalDeadweight: toNumber(row.total_deadweight_t),
      fuelOilCapacity: 0,
      freshWaterCapacity: 0,
      liquidMudCapacity: 0,
      dryBulkCapacity: 0,
      serviceSpeed: toNumber(row.service_speed_kts),
      operationalSpeed: toNumber(row.operational_speed_kts),
      dpClass,
      status,
      currentLocation: row.current_location_name ?? undefined,
      position,
    };
  }

  private mapInstallationRow(row: InstallationRow): InstallationSummary {
    return {
      id: row.id,
      name: row.name,
      type: installationTypeMap[row.type] ?? row.type,
      distance: toNumber(row.distance_from_base_nm),
      basin: 'Campos Basin',
    };
  }

  private mapCargoRow(
    row: CargoRow,
    incompatibleMap: Map<string, Set<string>>
  ): CargoCatalogDefinition {
    const incompatibleWith = incompatibleMap.get(row.id);
    const mappedCategory = cargoCategoryMap[row.category] ?? 'deck_cargo';

    return {
      type: row.id as CargoCatalogDefinition['type'],
      category: mappedCategory,
      name: row.name,
      density: toNumber(row.density_kg_m3),
      requiresSegregation: row.segregation_required,
      incompatibleWith: incompatibleWith ? Array.from(incompatibleWith).sort() : undefined,
    };
  }

  private mapCompatibilityRows(rows: CompatibilityRow[]): {
    compatibilityRules: CargoCompatibilityRule[];
    incompatibleMap: Map<string, Set<string>>;
  } {
    const incompatibleMap = new Map<string, Set<string>>();
    const rules: CargoCompatibilityRule[] = [];

    const register = (from: string, to: string, cleaningTime: number) => {
      if (!incompatibleMap.has(from)) {
        incompatibleMap.set(from, new Set());
      }
      incompatibleMap.get(from)?.add(to);
      rules.push({
        fromCargo: from,
        toCargo: to,
        cleaningTimeHours: cleaningTime,
        compatible: false,
      });
    };

    rows.forEach((row) => {
      const cleaningTime = toNumber(row.cleaning_time_h);
      register(row.cargo_type_id_1, row.cargo_type_id_2, cleaningTime);
      register(row.cargo_type_id_2, row.cargo_type_id_1, cleaningTime);
    });

    return { compatibilityRules: rules, incompatibleMap };
  }

  private buildBerths(bases: SupplyBaseRow[], vessels: Vessel[]): Berth[] {
    if (!bases.length) {
      return [];
    }

    const vesselsInPort = vessels.filter((vessel) => vessel.status === 'available' || vessel.status === 'in_port');
    let assignedIndex = 0;

    return bases.flatMap((base) => {
      const count = Math.max(1, Math.trunc(toNumber(base.num_berths, 1)));
      return Array.from({ length: count }, (_, idx) => {
        const vessel = idx === 0 ? vesselsInPort[assignedIndex] : undefined;
        if (idx === 0 && vessel) {
          assignedIndex = Math.min(vesselsInPort.length, assignedIndex + 1);
        }
        return {
          id: `${base.id}-berth-${idx + 1}`,
          name: `${base.name} Berth ${idx + 1}`,
          port: PORTO_DO_ACU,
          maxDraught: toNumber(base.max_draught_m, 21.7),
          maxLength: toNumber(base.max_vessel_length_m, 350),
          maxDeadweight: toNumber(base.max_deadweight_t, 200000),
          status: vessel ? 'occupied' : 'available',
          currentVesselId: vessel?.id,
        } as Berth;
      });
    });
  }

  private buildBreakdowns(
    vessels: Vessel[],
    installations: InstallationSummary[],
    cargoCatalog: CargoCatalogDefinition[]
  ): DataOverviewResponse['breakdowns'] {
    return {
      fleetByType: countBy(vessels, 'type'),
      fleetByStatus: countBy(vessels, 'status'),
      installationsByType: countBy(installations, 'type'),
      cargoByCategory: countBy(cargoCatalog, 'category'),
    };
  }
}

export const dataOverviewService = new DataOverviewService();
