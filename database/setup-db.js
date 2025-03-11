// database/setup-db.js - Database setup script

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  multipleStatements: true, // Allows multiple SQL statements
};

// Database name
const dbName = process.env.DB_NAME || "korean_learning_app";

// Path to schema file
const schemaPath = path.join(__dirname, "schema.sql");

// Main setup function
async function setupDatabase() {
  let connection;

  try {
    // Connect to MySQL (without database)
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to MySQL server");

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database '${dbName}' created or already exists`);

    // Use the database
    await connection.query(`USE ${dbName}`);
    console.log(`Using database '${dbName}'`);

    // Read schema SQL
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    // Execute schema SQL
    console.log("Creating tables...");
    await connection.query(schemaSql);
    console.log("Database schema initialized successfully");

    // Check if tables were created
    const [tables] = await connection.query("SHOW TABLES");
    console.log("Created tables:");
    tables.forEach((table) => {
      console.log(`- ${Object.values(table)[0]}`);
    });

    console.log("\nDatabase setup completed successfully!");
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Run the setup
setupDatabase();
