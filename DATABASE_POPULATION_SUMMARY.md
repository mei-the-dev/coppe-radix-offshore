# Database Population Summary

## Overview

A comprehensive database seed script has been created to populate the PRIO Offshore Logistics database with all operational data gathered through the reference reports.

## What Was Created

### 1. Seed Script (`backend/src/db/seed.ts`)

A complete TypeScript seed script that populates the database with:

- **Supply Bases**: Porto do Açu with full specifications
- **8 Installations**: All FPSOs and platforms with coordinates, capacities, and operational limits
- **Distance Matrix**: All routes between locations with travel times
- **20+ Cargo Types**: Complete catalog of liquids, dry bulk, and deck cargo
- **Cargo Incompatibility Matrix**: Cleaning times between incompatible cargoes
- **6 Vessels**: Complete fleet (Standard PSV, Large PSV, CSV, WSV) with specifications
- **Vessel Compartments**: Tank and deck capacities for vessels
- **Installation Storage**: Storage capacities, current levels, safety stocks, and reorder points
- **Consumption Profiles**: Daily consumption rates with scenario factors (normal, drilling, workover, low)
- **Cost Structures**: Charter rates, fuel prices, port costs, and handling costs
- **Operation Windows**: Weather limits for different operation types
- **Seasonal Patterns**: Monthly weather statistics for Campos Basin

### 2. Documentation (`backend/DATABASE_SEED.md`)

Complete documentation covering:
- Overview of seed data
- Data sources (reference reports)
- How to run the seed
- What gets populated
- Verification queries
- Troubleshooting guide

### 3. Package.json Script

Added `npm run seed` command for easy execution.

## Data Sources

The seed data is based on:

1. **prio-offshore-logistics-report (2).md** - Company operations, infrastructure, and strategic information
2. **prio-logistics-data-model (1).md** - Technical specifications, vessel characteristics, and operational parameters
3. **inventory.md** - Detailed inventory data, cargo types, and compatibility matrices
4. **metrics.md** - Performance metrics and consumption patterns
5. **prio_logistics_data_structure.tsx** - Data structure definitions

## Key Data Points Populated

### Installations
- FPSO Bravo (Tubarão Martelo) - 70 NM, 121m depth, 16k bpd capacity
- Platform Polvo A - 70 NM, 121m depth, 8k bpd capacity
- FPSO Valente (Frade) - 67 NM, 1200m depth, 100k bpd capacity
- FPSO Forte (Albacora Leste) - 75 NM, 1000m depth, 180k bpd capacity
- FPSO Peregrino - 46 NM, 120m depth, 110k bpd capacity
- 3 Peregrino Platforms (A, B, C) - 46 NM each

### Vessels
- 2x Standard PSV (UT 755 type) - $11,500/day charter
- 2x Large PSV (UT 874 type) - $17,000-$20,000/day charter
- 1x CSV Normand Pioneer - $42,500/day charter
- 1x Well Stimulation Vessel - $27,500/day charter

### Cargo Types
- **Liquids**: Diesel, Fresh Water, OBM, WBM, Brine, Methanol, Chemicals, Base Oil
- **Dry Bulk**: Cement, Barite, Bentonite, Drilling Chemicals
- **Deck Cargo**: Drill Pipes, Casing, Containers, Equipment, Provisions, Waste

### Consumption Profiles
- Daily consumption rates for each installation and cargo type
- Scenario factors: Normal (1.0x), Drilling (1.5-2.0x), Workover (1.2-1.5x), Low (0.6-0.8x)
- Variability statistics (std dev, coefficient of variation)

### Storage Capacities
- Maximum capacities per installation and cargo type
- Current inventory levels (realistic starting values)
- Safety stocks (ANP compliant: 48h diesel, 36h water)
- Reorder points

## How to Use

### 1. Run Migrations First
```bash
cd backend
npm run migrate
```

### 2. Run Seed Script
```bash
npm run seed
```

### 3. Verify Data
```sql
-- Check installations
SELECT id, name, type, distance_from_base_nm FROM installations;

-- Check vessels
SELECT id, name, class, charter_rate_daily_usd FROM vessels;

-- Check inventory levels
SELECT * FROM mv_current_inventory WHERE inventory_status IN ('Critical', 'Low');
```

## Data Integrity Features

- **Idempotent**: Can be run multiple times safely
- **Conflict Handling**: Uses `ON CONFLICT` to update existing records
- **Transaction Safety**: All inserts wrapped in transaction (rollback on error)
- **Materialized View Refresh**: Automatically refreshes analytics views after seeding

## Next Steps

1. **Run the seed script** to populate the database
2. **Verify data** using the SQL queries in DATABASE_SEED.md
3. **Test API endpoints** to ensure data is accessible
4. **Run optimization models** using the populated data
5. **Generate reports** and dashboards

## Notes

- All monetary values are in USD
- Distances are in Nautical Miles (NM)
- Capacities use metric units (m³, tonnes)
- Coordinates use WGS84 (EPSG:4326)
- Time values are in hours
- Charter rates are daily rates

## Files Modified/Created

1. ✅ `backend/src/db/seed.ts` - Complete seed script (new)
2. ✅ `backend/DATABASE_SEED.md` - Documentation (new)
3. ✅ `backend/package.json` - Added `seed` script
4. ✅ `DATABASE_POPULATION_SUMMARY.md` - This file (new)

## Verification Checklist

- [ ] Database migrations completed successfully
- [ ] Seed script runs without errors
- [ ] All installations populated (8 total)
- [ ] All vessels populated (6 total)
- [ ] All cargo types populated (20+ types)
- [ ] Distance matrix complete
- [ ] Consumption profiles created
- [ ] Storage capacities set
- [ ] Materialized views refreshed
- [ ] API endpoints return data correctly

## Support

For issues or questions:
- Check `backend/DATABASE_SEED.md` for troubleshooting
- Review seed script logs for specific errors
- Verify database connection and permissions
- Ensure all migrations completed successfully