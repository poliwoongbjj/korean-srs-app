// config/database.js - Database connection configuration

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

// Helper function for executing SQL queries
const query = async (sql, params) => {
  try {
    const [rows, fields] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
};

module.exports = {
  pool,
  getConnection,
  query,
};
