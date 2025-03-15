-- Database schema for Korean Learning App
-- Drop tables if they exist (in reverse order of creation to respect foreign keys)
DROP TABLE IF EXISTS user_stats;
DROP TABLE IF EXISTS deck_cards;
DROP TABLE IF EXISTS decks;
DROP TABLE IF EXISTS review_history;
DROP TABLE IF EXISTS user_cards;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories for organizing vocabulary
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cards table (vocabulary/phrases)
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- User cards progress (spaced repetition data)
CREATE TABLE user_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  card_id INT NOT NULL,
  ease_factor FLOAT DEFAULT 2.5, /* Anki-style ease factor */
  review_interval INT DEFAULT 0, /* Days until next review */
  repetitions INT DEFAULT 0, /* Number of successful reviews */
  last_review TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  next_review TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_card (user_id, card_id)
);

-- Review history
CREATE TABLE review_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  card_id INT NOT NULL,
  rating TINYINT NOT NULL, /* 1-4 rating (Again, Hard, Good, Easy) */
  review_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  time_taken_ms INT, /* How long the review took */
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- Decks for organizing study sessions
CREATE TABLE decks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Junction table for cards in decks
CREATE TABLE deck_cards (
  deck_id INT NOT NULL,
  card_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (deck_id, card_id),
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- User study stats
CREATE TABLE user_stats (
  user_id INT PRIMARY KEY,
  cards_studied INT DEFAULT 0,
  total_reviews INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_study_date DATE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_preferences (
  user_id INT PRIMARY KEY,
  new_cards_per_day INT DEFAULT 10,
  reviews_per_day INT DEFAULT 50,
  study_order VARCHAR(20) DEFAULT 'random',
  theme VARCHAR(20) DEFAULT 'light',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert some initial categories
INSERT INTO categories (name, description) VALUES
('Basics', 'Essential Korean phrases and greetings'),
('Numbers', 'Korean numbers and counting'),
('Food & Dining', 'Vocabulary for ordering food and dining out'),
('Travel', 'Essential phrases for traveling'),
('Grammar', 'Basic Korean grammar structures');