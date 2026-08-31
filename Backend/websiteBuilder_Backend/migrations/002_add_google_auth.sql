-- Migration: Add Google Authentication Support
-- Created: 2026-08-31
-- Description: Adds google_id field to users table and makes password_hash nullable for Google-only users

-- Step 1: Add google_id column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE NULL;

-- Step 2: Make password_hash nullable (for Google-only accounts)
ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

-- Step 3: Add index on google_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Note: Existing users will not be affected
-- Their password_hash remains set and google_id is NULL
-- New Google users will have google_id set and password_hash NULL
