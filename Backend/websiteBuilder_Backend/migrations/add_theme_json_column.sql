-- Migration: Add theme_json column to generated_websites table
-- This migration adds a theme_json JSONB column to store theme CSS configuration
-- for each generated website, enabling proper styling on published sites.
--
-- Usage:
--   sudo -u postgres psql -d websiteBuilder -f migrations/add_theme_json_column.sql

-- Add the theme_json column
ALTER TABLE generated_websites 
ADD COLUMN IF NOT EXISTS theme_json JSONB DEFAULT NULL;

-- Verify the column was added
\echo 'Migration completed: theme_json column added to generated_websites table'
