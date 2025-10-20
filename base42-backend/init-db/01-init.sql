-- Initialize base42 database
-- This script runs when PostgreSQL container starts for the first time

-- Connect to the base42 database
\c base42;

-- Create extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Log initialization
SELECT 'Database base42 initialized successfully' as message;