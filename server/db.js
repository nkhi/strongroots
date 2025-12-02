const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for CockroachDB Serverless
  }
});

// Test the connection
console.log('[DB] ⏳ Attempting to connect to CockroachDB...');
pool.connect((err, client, release) => {
  if (err) {
    console.error('[DB] ❌ Error acquiring client', err.stack);
    console.error('[DB] 💡 Check your .env file and internet connection.');
  } else {
    console.log('[DB] ✅ Connected to CockroachDB successfully');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
