#!/usr/bin/env node
// migrate.js - Database migration CLI tool

const MigrationRunner = require('./migrations/migration-runner');

async function main() {
  const command = process.argv[2];
  const migrationName = process.argv[3];

  const runner = new MigrationRunner();

  try {
    switch (command) {
      case 'up':
      case 'run':
        await runner.runMigrations();
        break;
        
      case 'down':
      case 'rollback':
        if (!migrationName) {
          console.error('❌ Please specify a migration filename to rollback');
          process.exit(1);
        }
        await runner.rollback(migrationName);
        break;
        
      case 'status':
        const executedMigrations = await runner.getExecutedMigrations();
        const migrationFiles = await runner.getMigrationFiles();
        
        console.log('\n📊 Migration Status:');
        console.log('='.repeat(50));
        
        if (migrationFiles.length === 0) {
          console.log('No migration files found');
        } else {
          migrationFiles.forEach(file => {
            const status = executedMigrations.includes(file) ? '✅ Executed' : '⏳ Pending';
            console.log(`${status} - ${file}`);
          });
        }
        console.log('='.repeat(50));
        break;
        
      default:
        console.log(`
🚀 Korean SRS App Migration Tool

Usage:
  npm run migrate <command> [args]

Commands:
  run, up           Run all pending migrations
  rollback, down    Rollback a specific migration
  status            Show migration status

Examples:
  npm run migrate run
  npm run migrate status  
  npm run migrate rollback 2025_01_13_120001_seed_initial_data.js
        `);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = main;