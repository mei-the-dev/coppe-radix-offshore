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
SELECT ST_MakePoint(-43.3946, -22.3708) AS macae_port_location;
