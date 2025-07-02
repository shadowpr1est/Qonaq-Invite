-- Production Database Initialization Script
-- Invitly PostgreSQL Database Setup

-- Create database if not exists (handled by Docker)
-- Ensure UTF8 encoding
-- ALTER DATABASE invitly_db SET timezone TO 'UTC';

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search optimization

-- Create indexes for better performance
-- Note: Tables will be created by Alembic migrations

-- Create a function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- This function will be used by triggers created in Alembic migrations

-- Optimize PostgreSQL settings for production
-- These would typically be set in postgresql.conf, but included here for reference

-- Performance optimization comments:
-- shared_buffers = 256MB (25% of RAM)
-- effective_cache_size = 1GB (75% of RAM)  
-- random_page_cost = 1.1 (for SSD)
-- wal_buffers = 16MB
-- checkpoint_completion_target = 0.9
-- max_connections = 100

-- Security settings:
-- log_statement = 'all' (log all statements)
-- log_connections = on
-- log_disconnections = on

COMMIT; 