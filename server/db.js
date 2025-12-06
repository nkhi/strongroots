const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for CockroachDB Serverless
  }
});

// The pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('[DB] ❌ Unexpected error on idle client', err);
  // Don't exit the process, just log the error. 
  // The pool will discard the client and create a new one when needed.
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
