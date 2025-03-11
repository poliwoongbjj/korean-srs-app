// config/database.js - Improved database connection configuration

const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "korean_learning_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to test connection
const getConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return connection;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
};

/**
 * Helper function for executing SQL queries with proper parameter type handling
 *
 * @param {string} sql - SQL query with placeholders
 * @param {Array} params - Parameters to bind to the query
 * @returns {Promise<Array>} - Query results
 */
const query = async (sql, params = []) => {
  try {
    // Process each parameter to ensure proper type handling
    const processedParams = params.map((param) => {
      // Handle undefined values
      if (param === undefined) return null;

      // Handle explicit LIMIT/OFFSET parameters
      if (sql.includes("LIMIT") || sql.includes("OFFSET")) {
        // Convert numeric strings to numbers for LIMIT and OFFSET
        if (typeof param === "string" && !isNaN(param)) {
          return Number(param);
        }
      }

      return param;
    });

    // For debugging
    // console.log('Executing query:', sql);
    // console.log('With parameters:', processedParams);

    const [rows, fields] = await pool.execute(sql, processedParams);
    return rows;
  } catch (error) {
    console.error("Query error:", error);
    console.error("SQL:", sql);
    console.error("Parameters:", params);
    throw error;
  }
};

/**
 * Execute a raw SQL query (for cases where prepared statements cause issues)
 * USE WITH CAUTION - only for trusted input, not user-supplied data
 *
 * @param {string} sql - SQL query string
 * @returns {Promise<Array>} - Query results
 */
const rawQuery = async (sql) => {
  try {
    const [rows, fields] = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error("Raw query error:", error);
    console.error("SQL:", sql);
    throw error;
  }
};

/**
 * Format a query with LIMIT clause safely
 *
 * @param {string} sql - Base SQL query without LIMIT
 * @param {Array} params - Parameters for the base query
 * @param {number} limit - Limit value
 * @param {number} offset - Optional offset value
 * @returns {Promise<Array>} - Query results
 */
const queryWithLimit = async (sql, params = [], limit = 100, offset = 0) => {
  // Convert limit and offset to numbers
  const numLimit = parseInt(limit, 10);
  const numOffset = parseInt(offset, 10);

  // Create a query with literal LIMIT/OFFSET values
  const sqlWithLimit = `${sql} LIMIT ${numLimit}${
    offset ? ` OFFSET ${numOffset}` : ""
  }`;

  // Execute the query with the base parameters
  return await query(sqlWithLimit, params);
};

module.exports = {
  pool,
  getConnection,
  query,
  rawQuery,
  queryWithLimit,
};
