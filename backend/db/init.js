/**
 * Database Initialization Module
 * Handles connection pooling and schema creation on startup
 */

import { Pool } from "pg";

let pool = null;

/**
 * Initialize database connection pool
 * @returns {Pool} PostgreSQL connection pool
 */
export function initializePool() {
  if (pool) {
    return pool;
  }

  const USE_DATABASE = process.env.USE_DATABASE === "true";

  if (!USE_DATABASE) {
    console.warn("⚠️  Database disabled (USE_DATABASE=false) - using in-memory storage");
    return null;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not set in environment");
    throw new Error("DATABASE_URL environment variable is required when USE_DATABASE=true");
  }

  pool = new Pool({
    connectionString: databaseUrl,
    max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    application_name: "skinx-backend",
  });

  pool.on("error", (err) => {
    console.error("❌ Unexpected pool error:", err);
    process.exit(1);
  });

  return pool;
}

/**
 * Get database connection pool
 * @returns {Pool|null} PostgreSQL pool or null if database disabled
 */
export function getPool() {
  if (!pool && process.env.USE_DATABASE === "true") {
    return initializePool();
  }
  return pool;
}

/**
 * Initialize database schema - creates tables if they don't exist
 */
export async function initializeSchema() {
  const pool = getPool();
  if (!pool) {
    console.info("Database disabled - skipping schema initialization");
    return;
  }

  const client = await pool.connect();
  try {
    console.log("📊 Initializing database schema...");

    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        password_hash TEXT,
        auth_method TEXT DEFAULT 'email',
        email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Create indexes for users table
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
    `);

    // Create otp_verifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT NOT NULL,
        purpose TEXT NOT NULL,
        otp_hash TEXT,
        full_name TEXT,
        password_hash TEXT,
        expires_at TIMESTAMPTZ NOT NULL,
        attempts INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Create indexes for otp_verifications table
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_otp_email_purpose ON otp_verifications(email, purpose);
      CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_verifications(expires_at);
    `);

    // Create password_resets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        is_used BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        used_at TIMESTAMPTZ
      );
    `);

    // Create indexes for password_resets table
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token_hash);
      CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
      CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);
    `);

    console.log("✅ Database schema initialized successfully");
  } catch (error) {
    console.error("❌ Schema initialization error:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close database connection pool
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("Database connection closed");
  }
}

/**
 * Query helper for safe database operations
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
export async function query(sql, params = []) {
  const pool = getPool();
  if (!pool) {
    throw new Error("Database not initialized");
  }
  return pool.query(sql, params);
}
