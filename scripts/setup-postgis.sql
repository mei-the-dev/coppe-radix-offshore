-- PostGIS Extension Setup for DigitalOcean App Platform
-- Run this script after database is provisioned
-- Connect via App Platform console or psql client

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify PostGIS installation
SELECT PostGIS_version();

-- List all installed extensions
SELECT * FROM pg_extension WHERE extname = 'postgis';

-- Test PostGIS functionality
SELECT ST_MakePoint(-41.0, -21.8333) AS porto_acu_location;
