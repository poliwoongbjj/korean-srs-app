// migrations/migration-runner.js - Database migration runner
const fs = require('fs').promises;
const path = require('path');
const { query, rawQuery } = require('../config/database');

class MigrationRunner {
  constructor() {
    this.migrationsPath = __dirname;
  }

  async ensureMigrationsTable() {
    await rawQuery(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getExecutedMigrations() {
    const migrations = await query('SELECT filename FROM migrations ORDER BY executed_at');
    return migrations.map(m => m.filename);
  }

  async getMigrationFiles() {
    const files = await fs.readdir(this.migrationsPath);
    return files
      .filter(file => file.match(/^\d{4}_\d{2}_\d{2}_\d{6}_.*\.js$/))
      .sort();
  }

  async runMigrations() {
    try {
      console.log('🚀 Starting migrations...');
      
      // Ensure migrations table exists
      await this.ensureMigrationsTable();
      
      // Get executed migrations
      const executedMigrations = await this.getExecutedMigrations();
      
      // Get all migration files
      const migrationFiles = await this.getMigrationFiles();
      
      // Filter out already executed migrations
      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.includes(file)
      );

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations found');
        return;
      }

      console.log(`📝 Found ${pendingMigrations.length} pending migrations`);

      // Execute pending migrations
      for (const filename of pendingMigrations) {
        console.log(`⚡ Running migration: ${filename}`);
        
        const migrationPath = path.join(this.migrationsPath, filename);
        const migration = require(migrationPath);
        
        // Run the migration
        if (typeof migration.up === 'function') {
          await migration.up();
        } else {
          throw new Error(`Migration ${filename} does not export an 'up' function`);
        }
        
        // Record the migration as executed
        await query('INSERT INTO migrations (filename) VALUES (?)', [filename]);
        
        console.log(`✅ Completed migration: ${filename}`);
      }

      console.log('🎉 All migrations completed successfully!');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async rollback(filename) {
    try {
      console.log(`🔄 Rolling back migration: ${filename}`);
      
      const migrationPath = path.join(this.migrationsPath, filename);
      const migration = require(migrationPath);
      
      if (typeof migration.down === 'function') {
        await migration.down();
        await query('DELETE FROM migrations WHERE filename = ?', [filename]);
        console.log(`✅ Rollback completed: ${filename}`);
      } else {
        throw new Error(`Migration ${filename} does not export a 'down' function`);
      }
      
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
}

module.exports = MigrationRunner;