import pg from 'pg';

const { Pool } = pg;

let pool;

/**
 * Get or create a connection pool to Cloud SQL.
 * Uses Unix socket when running on Cloud Run, TCP when running locally.
 * @returns {pg.Pool}
 */
export function getPool() {
    if (!pool) {
        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction && process.env.CLOUD_SQL_CONNECTION_NAME) {
            // Cloud Run connects via Unix socket through Cloud SQL Auth Proxy
            pool = new Pool({
                user: process.env.DB_USER || 'appuser',
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME || 'skillforge',
                host: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
            });
        } else {
            // Local development — connect via TCP
            pool = new Pool({
                connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/skillforge',
            });
        }

        // Log pool errors (but never expose to clients)
        pool.on('error', (err) => {
            console.error('Unexpected database pool error:', err);
        });
    }

    return pool;
}

/**
 * Execute a parameterized query.
 * @param {string} text - SQL query with $1, $2, ... placeholders
 * @param {any[]} params - Query parameters
 * @returns {Promise<pg.QueryResult>}
 */
export async function query(text, params) {
    const start = Date.now();
    const result = await getPool().query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 80), duration, rows: result.rowCount });
    return result;
}
