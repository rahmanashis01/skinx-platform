-- ============================================================================
-- SkinX PostgreSQL Database Schema
-- ============================================================================
-- This schema is ready for VPS deployment with PostgreSQL
--
-- DEPLOYMENT INSTRUCTIONS:
-- 1. Create database: createdb skinx_production
-- 2. Run this schema: psql skinx_production < database-schema.sql
-- 3. Update backend/.env with DATABASE_URL
-- 4. Install pg package: npm install pg
-- 5. Replace localStorage/in-memory storage with db queries
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Stores user account information
-- Currently using Auth0, but can store additional user data here
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth0_id VARCHAR(255) UNIQUE NOT NULL,  -- Auth0 user ID (from JWT sub claim)
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,  -- Store additional user preferences

  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_auth0_id ON users(auth0_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ============================================================================
-- SESSIONS TABLE
-- ============================================================================
-- Stores user scanning sessions with patient metadata
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Patient metadata
  age INTEGER CHECK (age > 0 AND age < 150),
  gender VARCHAR(50),
  region VARCHAR(100),
  skin_tone VARCHAR(100),
  body_area VARCHAR(100),

  -- Session tracking
  scan_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT valid_gender CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'))
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_sessions_is_active ON sessions(is_active);

-- ============================================================================
-- ANALYSES TABLE
-- ============================================================================
-- Stores photo analysis results
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Photo information
  photo_count INTEGER NOT NULL CHECK (photo_count >= 1 AND photo_count <= 3),
  photo_urls TEXT[],  -- Array of S3/storage URLs (optional)

  -- Analysis results
  condition VARCHAR(255) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0.0 AND confidence <= 1.0),
  risk_level VARCHAR(50) NOT NULL,
  description TEXT,

  -- Detailed results (stored as JSON for flexibility)
  observations JSONB NOT NULL DEFAULT '[]'::jsonb,
  possible_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Session context (denormalized for easy querying)
  session_data JSONB DEFAULT '{}'::jsonb,

  -- Model metadata
  model_version VARCHAR(100),
  processing_time_ms INTEGER,
  analysis_source VARCHAR(50) DEFAULT 'model',  -- 'model', 'mock', 'fallback'
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT valid_severity CHECK (severity IN ('mild', 'moderate', 'severe', 'unknown')),
  CONSTRAINT valid_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'pending')),
  CONSTRAINT valid_source CHECK (analysis_source IN ('model', 'mock', 'fallback', 'manual'))
);

CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_session_id ON analyses(session_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_analyses_condition ON analyses(condition);
CREATE INDEX idx_analyses_risk_level ON analyses(risk_level);
CREATE INDEX idx_analyses_confidence ON analyses(confidence DESC);

-- GIN index for JSONB columns (for efficient JSON queries)
CREATE INDEX idx_analyses_observations ON analyses USING GIN (observations);
CREATE INDEX idx_analyses_possible_conditions ON analyses USING GIN (possible_conditions);
CREATE INDEX idx_analyses_session_data ON analyses USING GIN (session_data);

-- ============================================================================
-- CHAT_MESSAGES TABLE
-- ============================================================================
-- Stores RAG chatbot conversation history
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Message content
  message_type VARCHAR(50) NOT NULL,  -- 'user', 'bot', 'system'
  message_text TEXT NOT NULL,

  -- RAG context
  question TEXT,  -- Original user question
  response TEXT,  -- Bot response
  context JSONB DEFAULT '{}'::jsonb,  -- Session context used for RAG

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT valid_message_type CHECK (message_type IN ('user', 'bot', 'system'))
);

CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_type ON chat_messages(message_type);

-- ============================================================================
-- PHOTOS TABLE (Optional - if storing photos in PostgreSQL)
-- ============================================================================
-- Alternative: Store photos in S3 and only save URLs in analyses.photo_urls
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP DEFAULT NOW(),

  -- Photo metadata
  original_filename VARCHAR(255),
  file_size INTEGER,  -- bytes
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,

  -- Storage (choose one approach)
  photo_data BYTEA,  -- Store binary data directly (not recommended for large files)
  storage_url TEXT,  -- S3/Cloud storage URL (recommended)
  storage_key VARCHAR(500),  -- S3 key or file path

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT valid_mime_type CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/webp'))
);

CREATE INDEX idx_photos_analysis_id ON photos(analysis_id);
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_uploaded_at ON photos(uploaded_at DESC);

-- ============================================================================
-- AUDIT_LOG TABLE (Optional - for tracking important events)
-- ============================================================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Event details
  event_type VARCHAR(100) NOT NULL,  -- 'login', 'analysis_created', 'session_created', etc.
  event_action VARCHAR(100),
  entity_type VARCHAR(100),  -- 'user', 'analysis', 'session', etc.
  entity_id UUID,

  -- Request details
  ip_address INET,
  user_agent TEXT,

  -- Additional data
  details JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT valid_event_type CHECK (
    event_type IN ('login', 'logout', 'analysis_created', 'session_created',
                   'photo_uploaded', 'chat_message', 'error', 'other')
  )
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for sessions table
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment session scan_count when analysis is created
CREATE OR REPLACE FUNCTION increment_session_scan_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.session_id IS NOT NULL THEN
    UPDATE sessions
    SET scan_count = scan_count + 1,
        updated_at = NOW()
    WHERE id = NEW.session_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_scan_count_on_analysis
  AFTER INSERT ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION increment_session_scan_count();

-- ============================================================================
-- VIEWS (Optional - for common queries)
-- ============================================================================

-- Recent analyses with user info
CREATE VIEW recent_analyses AS
SELECT
  a.id,
  a.created_at,
  u.email,
  u.full_name,
  a.condition,
  a.severity,
  a.confidence,
  a.risk_level,
  a.photo_count,
  a.analysis_source
FROM analyses a
JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC;

-- User statistics
CREATE VIEW user_statistics AS
SELECT
  u.id AS user_id,
  u.email,
  u.full_name,
  COUNT(DISTINCT s.id) AS total_sessions,
  COUNT(DISTINCT a.id) AS total_analyses,
  MAX(a.created_at) AS last_analysis_date,
  COUNT(DISTINCT CASE WHEN a.risk_level = 'high' THEN a.id END) AS high_risk_count
FROM users u
LEFT JOIN sessions s ON u.id = s.user_id
LEFT JOIN analyses a ON u.id = a.user_id
GROUP BY u.id, u.email, u.full_name;

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Uncomment to insert sample data for development
/*
INSERT INTO users (auth0_id, email, full_name) VALUES
  ('auth0|test123', 'test@example.com', 'Test User');

INSERT INTO sessions (user_id, age, gender, region, skin_tone, body_area)
SELECT id, 35, 'male', 'asia', 'medium', 'arm' FROM users WHERE email = 'test@example.com';
*/

-- ============================================================================
-- GRANTS (adjust based on your database user)
-- ============================================================================

-- Grant permissions to application user
-- Replace 'skinx_app' with your actual database user
/*
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO skinx_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO skinx_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO skinx_app;
*/

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
--
-- TO MIGRATE FROM LOCALSTORAGE TO POSTGRESQL:
--
-- 1. Update backend/.env:
--    DATABASE_URL=postgresql://user:password@localhost:5432/skinx_production
--
-- 2. Install dependencies:
--    npm install pg
--
-- 3. Create database connection pool (backend/config/database.js):
--    const { Pool } = require('pg');
--    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
--    module.exports = pool;
--
-- 4. Replace localStorage calls:
--    Before: localStorage.setItem('analyses', JSON.stringify(data))
--    After:  await db.query('INSERT INTO analyses (...) VALUES (...)', [...])
--
-- 5. Update controllers (see TODOs in analyzeController.js)
--
-- ============================================================================

-- Schema version tracking
CREATE TABLE schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT NOW(),
  description TEXT
);

INSERT INTO schema_version (version, description) VALUES
  (1, 'Initial schema - users, sessions, analyses, photos, chat_messages, audit_log');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
