/**
 * Database Configuration
 * PostgreSQL connection pool for production deployment
 *
 * CURRENT STATE: Not active (using localStorage/in-memory storage)
 *
 * TO ACTIVATE ON VPS DEPLOYMENT:
 * 1. Install: npm install pg
 * 2. Set DATABASE_URL in .env
 * 3. Run database-schema.sql to create tables
 * 4. Set USE_DATABASE=true in .env
 * 5. Uncomment require() calls in controllers
 *
 * ENVIRONMENT VARIABLES NEEDED:
 * DATABASE_URL=postgresql://username:password@localhost:5432/skinx_production
 * USE_DATABASE=true
 * DB_SSL=true (for production)
 * DB_MAX_CONNECTIONS=20
 */

// Try to load pg module (only needed when USE_DATABASE=true)
let Pool;
try {
  Pool = require("pg").Pool;
} catch (error) {
  // pg not installed - database features will be disabled
  Pool = null;
}

// Check if database should be used
const USE_DATABASE = process.env.USE_DATABASE === "true";

// Database configuration
const dbConfig = {
  // Connection string (priority)
  connectionString: process.env.DATABASE_URL,

  // Or individual parameters (if DATABASE_URL not set)
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "skinx_production",
  user: process.env.DB_USER || "skinx_app",
  password: process.env.DB_PASSWORD,

  // Connection pool settings
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20, // Maximum connections
  min: 2, // Minimum connections
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Wait 10s for connection

  // SSL configuration (required for most cloud PostgreSQL services)
  ssl:
    process.env.DB_SSL === "true"
      ? {
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
        }
      : false,

  // Statement timeout (prevent long-running queries)
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT) || 30000, // 30 seconds
};

// Create connection pool
let pool = null;

if (USE_DATABASE) {
  if (!Pool) {
    console.error("❌ PostgreSQL driver (pg) not installed");
    console.error("   Install with: npm install pg");
    console.log("ℹ️  Database disabled - using in-memory storage");
  } else {
    try {
      pool = new Pool(dbConfig);

      // Log successful pool creation
      console.log("✅ PostgreSQL connection pool created");

      // Handle pool errors
      pool.on("error", (err) => {
        console.error("❌ Unexpected database pool error:", err);
        // Don't exit the process, just log the error
      });

      // Handle pool connection events
      pool.on("connect", (client) => {
        if (process.env.NODE_ENV === "development") {
          console.log("🔗 New database client connected");
        }
      });

      pool.on("acquire", (client) => {
        if (process.env.NODE_ENV === "development") {
          console.log("📤 Database client acquired from pool");
        }
      });

      pool.on("remove", (client) => {
        if (process.env.NODE_ENV === "development") {
          console.log("🗑️  Database client removed from pool");
        }
      });
    } catch (error) {
      console.error("❌ Failed to create database pool:", error.message);
      throw error;
    }
  }
} else {
  console.log("ℹ️  Database disabled - using in-memory storage");
  console.log("   To enable PostgreSQL: set USE_DATABASE=true in .env");
}

/**
 * Execute a query with automatic connection handling
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function query(text, params) {
  if (!USE_DATABASE || !pool) {
    throw new Error("Database not configured. Set USE_DATABASE=true in .env");
  }

  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === "development") {
      console.log("📊 Query executed:", {
        text,
        duration,
        rows: result.rowCount,
      });
    }

    return result;
  } catch (error) {
    console.error("❌ Database query error:", {
      message: error.message,
      query: text,
      params: params,
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} Database client
 */
async function getClient() {
  if (!USE_DATABASE || !pool) {
    throw new Error("Database not configured. Set USE_DATABASE=true in .env");
  }

  try {
    const client = await pool.connect();

    // Add query method to client
    const originalQuery = client.query.bind(client);
    client.query = (...args) => {
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Transaction query:", args[0]);
      }
      return originalQuery(...args);
    };

    // Add release method wrapper
    const originalRelease = client.release.bind(client);
    client.release = () => {
      if (process.env.NODE_ENV === "development") {
        console.log("🔓 Client released back to pool");
      }
      return originalRelease();
    };

    return client;
  } catch (error) {
    console.error("❌ Failed to get database client:", error.message);
    throw error;
  }
}

/**
 * Execute a transaction
 * @param {Function} callback - Async function to execute in transaction
 * @returns {Promise<any>} Transaction result
 */
async function transaction(callback) {
  if (!USE_DATABASE || !pool) {
    throw new Error("Database not configured. Set USE_DATABASE=true in .env");
  }

  const client = await getClient();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Transaction rolled back:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check database connection health
 * @returns {Promise<boolean>} Connection status
 */
async function healthCheck() {
  if (!USE_DATABASE || !pool) {
    return false;
  }

  try {
    const result = await pool.query(
      "SELECT NOW() as current_time, version() as version",
    );
    console.log("✅ Database health check passed:", {
      time: result.rows[0].current_time,
      postgres_version: result.rows[0].version.split(" ")[1],
    });
    return true;
  } catch (error) {
    console.error("❌ Database health check failed:", error.message);
    return false;
  }
}

/**
 * Get database statistics
 * @returns {Promise<Object>} Pool statistics
 */
async function getStats() {
  if (!USE_DATABASE || !pool) {
    return {
      enabled: false,
      message: "Database not enabled",
    };
  }

  return {
    enabled: true,
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    maxConnections: dbConfig.max,
    minConnections: dbConfig.min,
  };
}

/**
 * Gracefully close all database connections
 * @returns {Promise<void>}
 */
async function close() {
  if (pool) {
    console.log("🔒 Closing database connection pool...");
    await pool.end();
    console.log("✅ Database connections closed");
  }
}

// Graceful shutdown on process termination
process.on("SIGTERM", async () => {
  await close();
});

process.on("SIGINT", async () => {
  await close();
});

// Export database functions
module.exports = {
  // Core functions
  query,
  getClient,
  transaction,

  // Utility functions
  healthCheck,
  getStats,
  close,

  // Pool access (for advanced usage)
  pool,

  // Configuration
  isEnabled: USE_DATABASE,
  config: {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    maxConnections: dbConfig.max,
  },
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

// Example 1: Simple query
const db = require('./config/database');

const users = await db.query(
  'SELECT * FROM users WHERE email = $1',
  ['user@example.com']
);

// Example 2: Insert with returning
const result = await db.query(
  'INSERT INTO analyses (id, user_id, condition, severity) VALUES ($1, $2, $3, $4) RETURNING *',
  [analysisId, userId, 'melanoma', 'severe']
);

// Example 3: Transaction
await db.transaction(async (client) => {
  await client.query('INSERT INTO sessions (...) VALUES (...)', [...]);
  await client.query('INSERT INTO analyses (...) VALUES (...)', [...]);
  await client.query('UPDATE users SET last_analysis = NOW() WHERE id = $1', [userId]);
});

// Example 4: Health check
if (await db.healthCheck()) {
  console.log('Database is healthy');
}

// Example 5: Get pool statistics
const stats = await db.getStats();
console.log('Pool stats:', stats);

*/
