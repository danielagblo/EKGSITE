const { Pool } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL || process.env.PG_URI
if (!DATABASE_URL || typeof DATABASE_URL !== 'string' || !DATABASE_URL.trim()) {
  throw new Error('Postgres adapter requires DATABASE_URL environment variable (e.g. postgres://user:pass@host:5432/dbname)')
}

let pool
try {
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
  })
} catch (err) {
  throw new Error('Failed to create Postgres pool: ' + (err && err.message ? err.message : String(err)))
}

async function ensureTables() {
  const client = await pool.connect()
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, data JSONB)`)
    await client.query(`CREATE TABLE IF NOT EXISTS models (id TEXT PRIMARY KEY, data JSONB)`)
    await client.query(`CREATE TABLE IF NOT EXISTS testimonials (id TEXT PRIMARY KEY, data JSONB)`)
    await client.query(`CREATE TABLE IF NOT EXISTS news (id TEXT PRIMARY KEY, data JSONB)`)
    await client.query(`CREATE TABLE IF NOT EXISTS settings (id TEXT PRIMARY KEY, data JSONB)`)
  } finally { client.release() }
}

async function getRows(table) {
  await ensureTables()
  const res = await pool.query(`SELECT data FROM ${table} ORDER BY (data->>'createdAt') DESC NULLS LAST`)
  return res.rows.map(r => r.data)
}

async function saveRows(table, items) {
  await ensureTables()
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // We update/insert each item individually to avoid truncating existing data
    const query = `
      INSERT INTO ${table} (id, data) 
      VALUES ($1, $2) 
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
    `
    for (const item of items) {
      const id = item.id || (Math.random().toString(36).slice(2, 9))
      await client.query(query, [id, item])
    }
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally { client.release() }
}

module.exports = {
  getOrders: async () => await getRows('orders'),
  saveOrders: async (rows) => await saveRows('orders', rows),
  getModels: async () => await getRows('models'),
  saveModels: async (rows) => await saveRows('models', rows),
  getTestimonials: async () => await getRows('testimonials'),
  saveTestimonials: async (rows) => await saveRows('testimonials', rows),
  getNews: async () => await getRows('news'),
  saveNews: async (rows) => await saveRows('news', rows),
  getSettings: async () => {
    await ensureTables()
    const res = await pool.query(`SELECT data FROM settings WHERE id = 'global'`)
    return res.rows[0]?.data || {}
  },
  saveSettings: async (settings) => {
    await ensureTables()
    const query = `
      INSERT INTO settings (id, data) VALUES ('global', $1)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
    `
    await pool.query(query, [settings])
  }
}
// Also expose a migrate function to create required tables
module.exports.migrate = async function migrate() {
  await ensureTables()
}
