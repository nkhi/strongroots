import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false
});

// The pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err: Error) => {
  console.error('[DB] ❌ Unexpected error on idle client', err);
  // Don't exit the process, just log the error. 
  // The pool will discard the client and create a new one when needed.
});

// Test the connection
console.log('[DB] ⏳ Attempting to connect to PostgreSQL...');
pool.connect((err: Error | undefined, client: PoolClient | undefined, release: () => void) => {
  if (err) {
    console.error('[DB] ❌ Error acquiring client', err.stack);
    console.error('[DB] 💡 Check your .env file and database connection.');
  } else {
    console.log('[DB] ✅ Connected to PostgreSQL successfully');
    release();
  }
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export { pool };
