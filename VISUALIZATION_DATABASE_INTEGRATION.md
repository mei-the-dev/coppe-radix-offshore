# Visualization Database Integration

## Overview

The visualization page has been updated to use **real database data** instead of mock/static data. All data sources now query the PostgreSQL database with PostGIS extension.

## Data Sources Updated

### ✅ Vessels (`/fleet/vessels`)
- **Endpoint**: `prioAPI.vessels.list()`
- **Database Table**: `vessels` with PostGIS `current_location_coords`
- **Position Extraction**: 
  - Extracts `current_lat` and `current_lon` from PostGIS geography coordinates
  - Maps database fields (`class` → `type`, `availability_status` → `status`)
  - Normalizes vessel specifications from database schema

### ✅ Installations (`/installations`)
- **Endpoint**: `prioAPI.installations.list()`
- **Database Table**: `installations` with PostGIS `location`
- **Location Extraction**: 
  - Extracts latitude/longitude from PostGIS geography point
  - Includes storage levels and operational limits from database

### ✅ Supply Bases (`/supply-bases`)
- **New Endpoint**: `prioAPI.supplyBases.list()`
- **Database Table**: `supply_bases` with PostGIS `location`
- **Berths**: Derived from `supply_bases.num_berths` via `/supply-bases/:id/berths`

### ✅ Trips (`/trips`)
- **Endpoint**: `prioAPI.trips.list()`
- **Database Tables**: 
  - `trips` - Main trip data
  - `trip_waypoints` - Route waypoints with locations
  - `trip_cargo_manifest` - Cargo items per trip
  - `trip_delays` - Delay information
- **Route Visualization**: Uses waypoint locations from database

### ✅ Orders/Loading Plans (`/orders`)
- **Endpoint**: `api.getLoadingPlans()` → `prioAPI.orders.list()`
- **Database Tables**:
  - `orders` - Order/loading plan data
  - `order_items` - Cargo items in each order
  - `demands` - Source demand information
  - `installations` - Destination installations
- **Cargo Flow**: Shows cargo movements from supply bases to installations

## Changes Made

### Backend Changes

1. **New Supply Bases Endpoint** (`backend/src/routes/supplyBases.ts`)
   - `GET /supply-bases` - Lists all supply bases from database
   - `GET /supply-bases/:id/berths` - Gets berths for a supply base

2. **Vessel Position Extraction** (`backend/src/routes/fleet/vessels.ts`)
   - Added `current_lat` and `current_lon` to response
   - Handles NULL PostGIS coordinates safely

3. **All Endpoints Use Database**
   - `/fleet/vessels` - ✅ Database queries
   - `/installations` - ✅ Database queries  
   - `/trips` - ✅ Database queries
   - `/orders` - ✅ Database queries
   - `/supply-bases` - ✅ Database queries (new)

### Frontend Changes

1. **Vessel Data Normalization** (`frontend/src/components/organisms/Visualization.tsx`)
   - Properly extracts `current_lat` and `current_lon` from database response
   - Maps database schema fields to frontend types
   - Handles PostGIS coordinate format

2. **Supply Bases Integration**
   - Fetches supply bases from database first
   - Then fetches berths from supply base data
   - Falls back to legacy endpoints only if database fails

3. **Data Flow Order**
   - Supply bases fetched before berths (dependency)
   - All data sources use PRIO API endpoints (database-backed)
   - Legacy endpoints only as fallback

## Database Schema Requirements

The visualization requires these database tables with data:

### Required Tables
- ✅ `vessels` - Vessel fleet data with `current_location_coords` (PostGIS)
- ✅ `installations` - Platform/FPSO data with `location` (PostGIS)
- ✅ `supply_bases` - Port facilities with `location` (PostGIS) and `num_berths`
- ✅ `trips` - Trip records
- ✅ `trip_waypoints` - Route waypoints linking to `supply_bases` and `installations`
- ✅ `orders` - Loading plan/order data
- ✅ `order_items` - Cargo items in orders

### PostGIS Requirements
- All location data must use PostGIS `GEOGRAPHY(POINT, 4326)` type
- Coordinates extracted using `ST_Y()` and `ST_X()` functions
- NULL coordinates handled gracefully

## Verification

To verify the visualization is using real database data:

1. **Check Browser Console**
   - Look for "Fetched vessels: X" log messages
   - Check "Fetched installations: X" messages
   - Verify no "Failed to fetch" errors

2. **Database Query Verification**
   - All endpoints query actual database tables
   - No mock data imports in route handlers
   - PostGIS coordinates properly extracted

3. **Data Accuracy**
   - Vessel positions match database `current_location_coords`
   - Installation locations match database `location`
   - Trip routes use waypoint locations from database
   - Cargo flows use order destinations from database

## Fallback Behavior

The visualization includes fallback mechanisms:

1. **Primary**: Database queries via PRIO API endpoints
2. **Secondary**: Legacy endpoints (if database unavailable)
3. **Tertiary**: Hardcoded Porto do Açu coordinates (if all else fails)

This ensures the visualization always displays something, even if database is unavailable.

## Next Steps

To ensure complete database integration:

1. ✅ Verify database has data in all required tables
2. ✅ Ensure PostGIS extension is enabled
3. ✅ Check that vessel positions are being updated in database
4. ✅ Verify trip waypoints reference correct location IDs
5. ✅ Confirm order destinations match installation IDs

## Testing

Test the visualization with:
- Empty database (should show fallback data)
- Database with partial data (should show what's available)
- Full database (should show all real data)
- Database connection errors (should gracefully fallback)
