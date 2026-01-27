# Database Seed Documentation

This document describes the database seed script that populates the PRIO Offshore Logistics database with comprehensive operational data based on the reference reports.

## Overview

The seed script (`src/db/seed.ts`) populates the database with:

1. **Supply Bases** - Port of Macaé specifications
2. **Installations** - All FPSOs and platforms (8 installations)
3. **Distance Matrix** - Distances between all locations
4. **Cargo Types** - 20+ cargo types (liquids, dry bulk, deck cargo)
5. **Cargo Incompatibility Matrix** - Cleaning times between incompatible cargoes
6. **Vessels** - Fleet of 6 vessels (Standard PSV, Large PSV, CSV, WSV)
7. **Vessel Compartments** - Tank and deck capacities
8. **Installation Storage** - Storage capacities and current inventory levels
9. **Consumption Profiles** - Daily consumption rates by installation and cargo type
10. **Cost Structures** - Charter rates, fuel prices, port costs
11. **Operation Windows** - Weather limits for different operations
12. **Seasonal Patterns** - Monthly weather statistics for Campos Basin

## Data Sources

The seed data is based on:

- `references/prio-offshore-logistics-report (2).md` - Company operations and infrastructure
- `references/prio-logistics-data-model (1).md` - Technical specifications and parameters
- `references/inventory.md` - Detailed inventory and cargo data
- `references/metrics.md` - Performance metrics and KPIs
- `references/prio_logistics_data_structure.tsx` - Data structure definitions

## Running the Seed

### Prerequisites

1. Database must be migrated first:
   ```bash
   npm run migrate
   ```

2. Ensure PostgreSQL is running and accessible
3. Check `.env` file has correct database credentials

### Execute Seed

```bash
npm run seed
```

Or directly with tsx:
```bash
tsx src/db/seed.ts
```

## What Gets Populated

### Supply Bases

- **Macaé Port** (BRMEA)
  - Coordinates: 22°23'S, 41°47'W
  - Max draught: 7.9m
  - Max vessel length: 97m
  - Max deadweight: 5,513t
  - Operating hours: 24/7
  - 3 berths

### Installations (8 total)

1. **FPSO Bravo** (Tubarão Martelo) - 70 NM from Macaé
2. **Platform Polvo A** - 70 NM from Macaé
3. **FPSO Valente** (Frade) - 67 NM from Macaé
4. **FPSO Forte** (Albacora Leste) - 75 NM from Macaé
5. **FPSO Peregrino** - 46 NM from Macaé
6. **Platform Peregrino A** - 46 NM from Macaé
7. **Platform Peregrino B** - 46 NM from Macaé
8. **Platform Peregrino C** - 46 NM from Macaé

### Vessels (6 total)

1. **PSV Standard Alpha** - Standard PSV (UT 755 type)
2. **PSV Standard Beta** - Standard PSV (UT 755 type)
3. **PSV Large Gamma** - Large PSV (UT 874 type, DP-2)
4. **PSV Large Delta** - Large PSV (UT 874 type, DP-3)
5. **CSV Normand Pioneer** - Construction Support Vessel
6. **PSV Normand Carioca** - Well Stimulation Vessel

### Cargo Types (20+ types)

**Liquid Bulk:**
- Marine Diesel Oil
- Fresh Water (Potable)
- Oil-Based Drilling Mud
- Water-Based Drilling Mud
- Brine
- Methanol
- Chemical Products
- Base Oil

**Dry Bulk:**
- Cement
- Barite
- Bentonite
- Drilling Chemicals (Powder)

**Deck Cargo:**
- Drill Pipes (40 ft)
- Casing Pipes
- Containers (20 ft)
- Containers (40 ft)
- Equipment/Machinery
- Chemical Tanks/Drums
- Food/Provisions
- Waste Containers (Return)

### Distance Matrix

- All routes from Macaé to installations
- Inter-installation distances (e.g., Polvo to Bravo: 5.9 NM)
- Travel times at 12 and 14 knots
- Weather factors (good, moderate, rough)

### Consumption Profiles

Daily consumption rates for each installation and cargo type, including:
- Normal operations factor: 1.0x
- Drilling campaign factor: 1.5-2.0x
- Workover factor: 1.2-1.5x
- Low activity factor: 0.6-0.8x

### Storage Capacities

For each installation and cargo type:
- Maximum capacity
- Current inventory level
- Safety stock (ANP requirements: 48h diesel, 36h water)
- Reorder point

## Data Integrity

The seed script uses `ON CONFLICT` clauses to:
- Update existing records instead of failing
- Preserve data if seed is run multiple times
- Update timestamps on existing records

## Materialized Views

After seeding, the script automatically refreshes:
- `mv_current_inventory` - Current inventory status
- `mv_vessel_performance` - Vessel performance metrics

## Verification

After seeding, verify data with:

```sql
-- Check installations
SELECT id, name, type, distance_from_base_nm FROM installations;

-- Check vessels
SELECT id, name, class, charter_rate_daily_usd FROM vessels;

-- Check cargo types
SELECT id, name, category FROM cargo_types;

-- Check consumption profiles
SELECT installation_id, cargo_type_id, daily_consumption 
FROM consumption_profiles 
LIMIT 10;

-- Check inventory levels
SELECT * FROM mv_current_inventory 
WHERE inventory_status IN ('Critical', 'Low');
```

## Notes

- All monetary values are in USD
- Distances are in Nautical Miles (NM)
- Capacities use metric units (m³, tonnes)
- Coordinates use WGS84 (EPSG:4326)
- Time values are in hours
- Charter rates are daily rates

## Troubleshooting

### Error: "relation does not exist"
- Run migrations first: `npm run migrate`

### Error: "PostGIS extension not found"
- Install PostGIS: `sudo pacman -S postgis` (Arch) or equivalent
- Or comment out PostGIS-dependent code if not needed

### Error: "TimescaleDB extension not found"
- TimescaleDB is optional for weather_forecasts hypertable
- The seed script will continue even if TimescaleDB is not installed

### Data not appearing
- Check database connection in `.env`
- Verify migrations completed successfully
- Check for constraint violations in logs

## Updating Seed Data

To update seed data:

1. Edit `src/db/seed.ts`
2. Modify the data arrays (installations, vessels, etc.)
3. Run `npm run seed` again
4. The `ON CONFLICT` clauses will update existing records

## Next Steps

After seeding:

1. Verify data integrity
2. Test API endpoints
3. Run optimization models
4. Generate reports and dashboards