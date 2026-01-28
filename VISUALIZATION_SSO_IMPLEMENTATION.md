# Visualization - Database as Single Source of Truth (SSO)

## Overview

The visualization page has been updated to use the **database as the Single Source of Truth (SSO)**. All mock data fallbacks have been removed, and the visualization now exclusively uses database-backed endpoints.

## Changes Made

### ✅ Removed All Mock Data Fallbacks

1. **Vessels**
   - ❌ Removed: Fallback to `api.getVessels()` (mock data)
   - ✅ Now: Only uses `prioAPI.vessels.list()` (database)
   - ✅ Vessel details: Uses `prioAPI.vessels.get()` (database)

2. **Supply Bases**
   - ❌ Removed: Hardcoded port fallback (supply base is Porto do Açu from DB)
   - ✅ Now: Only uses `prioAPI.supplyBases.list()` (database)
   - ✅ If database is empty, shows empty state (no fallback)

3. **Berths**
   - ❌ Removed: Fallback to `api.getBerths()` (mock data)
   - ✅ Now: Only uses `prioAPI.supplyBases.getBerths()` (database)
   - ✅ Derived from `supply_bases` table in database

4. **Installations**
   - ✅ Already using database (`prioAPI.installations.list()`)
   - ✅ No changes needed

5. **Trips**
   - ✅ Already using database (`prioAPI.trips.list()`)
   - ✅ No changes needed

6. **Orders**
   - ✅ Already using database (`prioAPI.orders.list()`)
   - ✅ No changes needed

### ✅ Removed Hardcoded Constants

- ❌ Removed: `MACAE_PORT` constant
- ✅ Now: All locations come from database

### ✅ Enhanced Error Handling

- Clear error messages indicating database connection issues
- Empty state message when database has no data
- Console logging to verify data source (all logs show "from database (SSO)")

## Data Flow (SSO)

```
Database (PostgreSQL + PostGIS)
    ↓
Backend API Endpoints (Database Queries)
    ↓
PRIO API Client (prioAPI.*)
    ↓
Visualization Component
    ↓
Map Display
```

**No mock data, no fallbacks, no hardcoded values.**

## Database Requirements

The visualization requires these tables to be populated:

### Required Tables with Data

1. **`vessels`** - Vessel fleet
   - Must have `current_location_coords` (PostGIS) for position display
   - Required fields: `id`, `name`, `class`, `availability_status`

2. **`supply_bases`** - Port facilities
   - Must have `location` (PostGIS) for map display
   - Required fields: `id`, `name`, `num_berths`, `location`

3. **`installations`** - Offshore platforms
   - Must have `location` (PostGIS) for map display
   - Required fields: `id`, `name`, `type`, `location`

4. **`trips`** - Vessel trips (optional, for route visualization)
   - Links to `trip_waypoints` for route data

5. **`trip_waypoints`** - Route waypoints (optional)
   - Links to `supply_bases` and `installations`

6. **`orders`** - Loading plans/orders (optional, for cargo flows)
   - Links to `order_items` for cargo data

## Verification

### Console Logs

When the visualization loads, check the browser console for:

```
✅ Fetched vessels from database (SSO): X
✅ Fetched installations from database (SSO): X
✅ Fetched supply bases from database (SSO): X
✅ Fetched berths from database (SSO): X
✅ Fetched trips from database (SSO): X
✅ Fetched orders from database (SSO): X
```

### Empty Database Handling

If the database is empty or unavailable:

1. **Loading State**: Shows "Loading map data from database..."
2. **Error State**: Shows "Error loading data from database" with retry button
3. **Empty State**: Shows "No data available from database" with helpful message

### No Fallbacks

- ❌ No mock data will be displayed
- ❌ No hardcoded locations will be used
- ❌ No legacy endpoints will be called
- ✅ Only database data is displayed

## Benefits

1. **Data Accuracy**: Visualization always reflects actual database state
2. **No Confusion**: No mixing of mock and real data
3. **Clear Errors**: Users know immediately if database is empty/unavailable
4. **Production Ready**: Safe to deploy - won't accidentally show test data

## Migration Notes

If migrating from mock data:

1. **Populate Database**: Ensure all required tables have data
2. **Verify PostGIS**: Ensure coordinates are properly stored
3. **Test Empty States**: Verify error handling works correctly
4. **Check Console**: Verify all data sources show "(SSO)" in logs

## API Endpoints Used (All Database-Backed)

- ✅ `GET /fleet/vessels` - Database query
- ✅ `GET /fleet/vessels/:id` - Database query
- ✅ `GET /installations` - Database query
- ✅ `GET /installations/:id` - Database query
- ✅ `GET /supply-bases` - Database query
- ✅ `GET /supply-bases/:id/berths` - Database query
- ✅ `GET /trips` - Database query
- ✅ `GET /orders` - Database query

**All endpoints query PostgreSQL database directly - no mock data.**
