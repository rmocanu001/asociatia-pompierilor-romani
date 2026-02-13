const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

// Initialize database schema
db.serialize(() => {
  // Members table
  db.run(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      certificate_number TEXT UNIQUE NOT NULL,
      certificate_data TEXT,
      qr_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1
    )
  `);

  // Verifications table (log QR code scans)
  db.run(`
    CREATE TABLE IF NOT EXISTS verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id TEXT NOT NULL,
      verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      verified_by TEXT,
      FOREIGN KEY (member_id) REFERENCES members(id)
    )
  `);

  // Discounts table
  db.run(`
    CREATE TABLE IF NOT EXISTS discounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      partner_name TEXT NOT NULL,
      description TEXT,
      discount_percentage INTEGER,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database initialized successfully');
});

module.exports = db;
