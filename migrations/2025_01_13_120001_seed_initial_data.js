// migrations/2025_01_13_120001_seed_initial_data.js - Initial categories and admin user
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

const up = async () => {
  console.log('  🌱 Seeding initial data...');

  // Insert initial categories
  console.log('  📁 Creating initial categories...');
  const categories = [
    { name: 'Basics', description: 'Essential Korean phrases and greetings' },
    { name: 'Numbers', description: 'Korean numbers and counting' },
    { name: 'Food & Dining', description: 'Vocabulary for ordering food and dining out' },
    { name: 'Travel', description: 'Essential phrases for traveling' },
    { name: 'Grammar', description: 'Basic Korean grammar structures' }
  ];

  for (const category of categories) {
    await query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [category.name, category.description]
    );
  }

  // Create admin user (if not exists)
  console.log('  👤 Creating admin user...');
  const adminPassword = 'admin123'; // Change this to a secure password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  // Check if admin user already exists
  const existingAdmin = await query('SELECT id FROM users WHERE username = ?', ['admin']);
  
  let adminUserId;
  if (existingAdmin.length > 0) {
    console.log('  ℹ️  Admin user already exists, updating password...');
    await query('UPDATE users SET password_hash = ? WHERE username = ?', [hashedPassword, 'admin']);
    adminUserId = existingAdmin[0].id;
  } else {
    const adminUser = await query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      ['admin', 'admin@korean-srs.com', hashedPassword]
    );
    adminUserId = adminUser.insertId;
  }

  // Initialize user preferences for admin (if not exists)
  const existingPrefs = await query('SELECT user_id FROM user_preferences WHERE user_id = ?', [adminUserId]);
  if (existingPrefs.length === 0) {
    await query(
      'INSERT INTO user_preferences (user_id, new_cards_per_day, reviews_per_day, study_order, theme) VALUES (?, ?, ?, ?, ?)',
      [adminUserId, 20, 100, 'random', 'light']
    );
  }

  // Initialize user stats for admin (if not exists)
  const existingStats = await query('SELECT user_id FROM user_stats WHERE user_id = ?', [adminUserId]);
  if (existingStats.length === 0) {
    await query(
      'INSERT INTO user_stats (user_id, cards_studied, total_reviews, streak_days) VALUES (?, ?, ?, ?)',
      [adminUserId, 0, 0, 0]
    );
  }

  // Add some sample cards
  console.log('  📚 Adding sample cards...');
  const basicsCategory = await query('SELECT id FROM categories WHERE name = "Basics"');
  const basicsCategoryId = basicsCategory[0].id;

  const sampleCards = [
    {
      korean_text: '안녕하세요',
      english_text: 'Hello',
      romanization: 'annyeonghaseyo',
      example_sentence: '안녕하세요! 만나서 반가워요.',
      pronunciation_notes: 'Formal greeting'
    },
    {
      korean_text: '감사합니다',
      english_text: 'Thank you',
      romanization: 'gamsahamnida',
      example_sentence: '도와주셔서 감사합니다.',
      pronunciation_notes: 'Formal way to say thank you'
    },
    {
      korean_text: '안녕히 가세요',
      english_text: 'Goodbye',
      romanization: 'annyeonghi gaseyo',
      example_sentence: '안녕히 가세요! 내일 봐요.',
      pronunciation_notes: 'Said to someone leaving'
    }
  ];

  for (const card of sampleCards) {
    await query(
      'INSERT INTO cards (category_id, korean_text, english_text, romanization, example_sentence, pronunciation_notes) VALUES (?, ?, ?, ?, ?, ?)',
      [basicsCategoryId, card.korean_text, card.english_text, card.romanization, card.example_sentence, card.pronunciation_notes]
    );
  }

  console.log('  ✅ Initial data seeded successfully');
  console.log(`  🔑 Admin credentials: admin / ${adminPassword}`);
};

const down = async () => {
  console.log('  🗑️ Removing seeded data...');
  
  // Remove admin user and related data (CASCADE will handle related records)
  await query('DELETE FROM users WHERE username = ?', ['admin']);
  
  // Remove categories
  await query('DELETE FROM categories WHERE name IN (?, ?, ?, ?, ?)', 
    ['Basics', 'Numbers', 'Food & Dining', 'Travel', 'Grammar']);

  console.log('  ✅ Seeded data removed');
};

module.exports = { up, down };