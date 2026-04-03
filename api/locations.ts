import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { rows } = await pool.query(`
      SELECT id, name, description, address,
             longitude::float, latitude::float,
             category, rating::float, "workingHours"
      FROM locations
      ORDER BY name
    `)
    res.status(200).json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch locations' })
  }
}
