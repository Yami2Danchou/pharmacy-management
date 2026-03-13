import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export default sql

// Helper to run queries with error handling
export async function query(queryString, params = []) {
  try {
    const result = await sql(queryString, params)
    return { data: result, error: null }
  } catch (err) {
    console.error('Database error:', err)
    return { data: null, error: err.message }
  }
}
