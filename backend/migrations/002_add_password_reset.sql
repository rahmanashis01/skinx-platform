-- ============================================================================
-- MIGRATION 002: Add Password Reset Functionality
-- ============================================================================
-- This migration adds password support for traditional email/password auth
-- and creates a password_resets table for managing forgot password flows
--
-- Run this migration after initial schema:
-- psql skinx_production < migrations/002_add_password_reset.sql
-- ============================================================================

-- Step 1: Add password column to users table (if it doesn't exist)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS auth_method VARCHAR(50) DEFAULT 'auth0';

-- Add constraint separately to avoid conflicts
ALTER TABLE users
ADD CONSTRAINT valid_auth_method CHECK (auth_method IN ('auth0', 'email', 'social'));

-- Step 2: Create password_resets table for managing reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Token management
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  original_token VARCHAR(255),

  -- Token expiration and validity
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,

  -- Status tracking
  is_used BOOLEAN DEFAULT FALSE,

  -- Request context
  ip_address INET,
  user_agent TEXT,

  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_resets_is_used ON password_resets(is_used);
CREATE INDEX IF NOT EXISTS idx_password_resets_created_at ON password_resets(created_at DESC);

-- Update schema version
INSERT INTO schema_version (version, description) VALUES
  (2, 'Add password reset functionality - users password column and password_resets table')
ON CONFLICT (version) DO NOTHING;
