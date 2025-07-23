/**
 * Database Configuration Module
 * Handles MySQL connection setup with connection pooling for optimal performance
 * Supports cross-platform MySQL installations
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration with pooling
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'quantumshield_user',
  password: process.env.DB_PASSWORD || 'quantum_secure_2024',
  database: process.env.DB_NAME || 'quantumshield_db',
  port: process.env.DB_PORT || 3306,
  
  // Connection pool settings for better performance
  connectionLimit: 10, // Example: Adjust pool size
  idleTimeout: 60000, // Example: Idle connection timeout
  connectTimeout: 30000, // Example: Connection timeout
  
  // Enhanced connection settings for cross-platform compatibility
  charset: 'utf8mb4',
  timezone: '+00:00',
  
  // SSL configuration (enable in production)
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Execute a database query with automatic connection management
 * @param {string} query - SQL query to execute
 * @param {Array} params - Query parameters for prepared statements
 * @returns {Promise} Query results
 */
async function executeQuery(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('❌ Database Query Error:', {
      query: query.substring(0, 100),
      error: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Close all database connections (used during shutdown)
 */
async function closePool() {
  try {
    await pool.end();
    console.log('🔐 Database connection pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error.message);
  }
}

// Export functions and pool for use throughout the application
module.exports = {
  pool,
  executeQuery,
  testConnection,
  closePool,
  
  // Direct pool access for advanced operations
  getConnection: () => pool.getConnection(),
  
  // Database configuration info
  config: {
    host: dbConfig.host,
    database: dbConfig.database,
    port: dbConfig.port
  }
};