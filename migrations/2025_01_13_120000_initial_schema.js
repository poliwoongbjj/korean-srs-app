// migrations/2025_01_13_120000_initial_schema.js - Initial database schema
const { rawQuery } = require('../config/database');

const up = async () => {
  console.log('  📋 Creating initial database schema...');

  // Drop tables if they exist (in reverse order to respect foreign keys)
  await rawQuery('SET FOREIGN_KEY_CHECKS = 0');
  await rawQuery('DROP TABLE IF EXISTS user_stats');
  await rawQuery('DROP TABLE IF EXISTS deck_cards');
  await rawQuery('DROP TABLE IF EXISTS decks');
  await rawQuery('DROP TABLE IF EXISTS review_history');
  await rawQuery('DROP TABLE IF EXISTS user_cards');
  await rawQuery('DROP TABLE IF EXISTS user_preferences');
  await rawQuery('DROP TABLE IF EXISTS cards');
  await rawQuery('DROP TABLE IF EXISTS categories');
  await rawQuery('DROP TABLE IF EXISTS users');
  await rawQuery('SET FOREIGN_KEY_CHECKS = 1');

  // Users table
  await rawQuery(`
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Categories for organizing vocabulary
  await rawQuery(`
    CREATE TABLE categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Cards table (vocabulary/phrases)
  await rawQuery(`
    CREATE TABLE cards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT,
      korean_text VARCHAR(255) NOT NULL,
      english_text VARCHAR(255) NOT NULL,
      romanization VARCHAR(255),
      example_sentence TEXT,
      pronunciation_notes TEXT,
      image_url VARCHAR(255),
      audio_url VARCHAR(255),
      audio_file_path VARCHAR(255),
      card_type ENUM('recognition', 'production', 'spelling') DEFAULT 'recognition',
      related_card_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY (related_card_id) REFERENCES cards(id) ON DELETE CASCADE
    )
  `);

  // User cards progress (spaced repetition data)
  await rawQuery(`
    CREATE TABLE user_cards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      card_id INT NOT NULL,
      ease_factor FLOAT DEFAULT 2.5,
      review_interval INT DEFAULT 0,
      repetitions INT DEFAULT 0,
      last_review TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      next_review TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_card (user_id, card_id)
    )
  `);

  // Review history
  await rawQuery(`
    CREATE TABLE review_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      card_id INT NOT NULL,
      rating TINYINT NOT NULL,
      review_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      time_taken_ms INT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
    )
  `);

  // Decks for organizing study sessions
  await rawQuery(`
    CREATE TABLE decks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Junction table for cards in decks
  await rawQuery(`
    CREATE TABLE deck_cards (
      deck_id INT NOT NULL,
      card_id INT NOT NULL,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (deck_id, card_id),
      FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
    )
  `);

  // User study stats
  await rawQuery(`
    CREATE TABLE user_stats (
      user_id INT PRIMARY KEY,
      cards_studied INT DEFAULT 0,
      total_reviews INT DEFAULT 0,
      streak_days INT DEFAULT 0,
      last_study_date DATE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // User preferences
  await rawQuery(`
    CREATE TABLE user_preferences (
      user_id INT PRIMARY KEY,
      new_cards_per_day INT DEFAULT 10,
      reviews_per_day INT DEFAULT 50,
      study_order VARCHAR(20) DEFAULT 'random',
      theme VARCHAR(20) DEFAULT 'light',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('  ✅ Database schema created successfully');
};

const down = async () => {
  console.log('  🗑️ Dropping all tables...');
  
  await rawQuery('SET FOREIGN_KEY_CHECKS = 0');
  await rawQuery('DROP TABLE IF EXISTS user_stats');
  await rawQuery('DROP TABLE IF EXISTS deck_cards');
  await rawQuery('DROP TABLE IF EXISTS decks');
  await rawQuery('DROP TABLE IF EXISTS review_history');
  await rawQuery('DROP TABLE IF EXISTS user_cards');
  await rawQuery('DROP TABLE IF EXISTS user_preferences');
  await rawQuery('DROP TABLE IF EXISTS cards');
  await rawQuery('DROP TABLE IF EXISTS categories');
  await rawQuery('DROP TABLE IF EXISTS users');
  await rawQuery('SET FOREIGN_KEY_CHECKS = 1');

  console.log('  ✅ All tables dropped');
};

module.exports = { up, down };