/**
 * Database Configuration
 * PostgreSQL connection pool for production deployment
 *
 * ACTIVATION: Automatically enabled when USE_DATABASE=true
 *
 * REQUIRED ENVIRONMENT VARIABLES:
 * DATABASE_URL=postgresql://user:password@host:5432/dbname
 * USE_DATABASE=true
 */

const { Pool } = require("pg");
require("dotenv").config();

const USE_DATABASE = process.env.USE_DATABASE === "true";

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  host: process.env.POSTGRES_HOST || process.env.DB_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || process.env.DB_PORT) || 5432,
  database: process.env.POSTGRES_DB || process.env.DB_NAME || "skinx",
  user: process.env.POSTGRES_USER || process.env.DB_USER || "skinx",
  password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  application_name: "skinx-backend",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } : false,
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT) || 30000,
};

let pool = null;

if (USE_DATABASE) {
  try {
    pool = new Pool(dbConfig);
    console.log("✅ PostgreSQL connection pool created");
    pool.on("error", (err) => {
      console.error("❌ Unexpected database pool error:", err);
    });
  } catch (error) {
    console.error("❌ Failed to create database pool:", error.message);
    throw error;
  }
} else {
  console.log("ℹ️  Database disabled - using in-memory storage");
}

async function query(text, params = []) {
  if (!USE_DATABASE || !pool) {
    throw new Error("Database not configured");
  }
  return pool.query(text, params);
}

async function getClient() {
  if (!USE_DATABASE || !pool) {
    throw new Error("Database not configured");
  }
  return pool.connect();
}

async function transaction(callback) {
  if (!USE_DATABASE || !pool) {
    throw new Error("Database not configured");
  }
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function healthCheck() {
  if (!USE_DATABASE || !pool) return false;
  try {
    await pool.query("SELECT NOW()");
    return true;
  } catch (error) {
    console.error("❌ Database health check failed:", error.message);
    return false;
  }
}

async function close() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

function getPool() {
  return pool;
}

function isEnabled() {
  return USE_DATABASE && pool !== null;
}

process.on("SIGTERM", async () => {
  await close();
});

process.on("SIGINT", async () => {
  await close();
});

module.exports = {
  query,
  getClient,
  transaction,
  healthCheck,
  close,
  getPool,
  isEnabled,
  USE_DATABASE,
};