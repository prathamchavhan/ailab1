// app/api/jobs/route.js
import { Pool } from 'pg';
import { NextResponse } from 'next/server';

// Initialize the PostgreSQL connection pool using environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET handler to retrieve all jobs
export async function GET() {
  try {
    const client = await pool.connect();
    
    // SQL query to select all necessary fields from your jobs table
    // It's good practice to select columns explicitly rather than using '*'
    const result = await client.query(`
      SELECT 
        id, company_name, company_logo, job_role, summary, 
        salary_lakh, work_mode, job_type, location, apply_url, 
        created_at
      FROM 
        public.jobs
      ORDER BY 
        created_at DESC; 
    `); 
    
    client.release(); // Release the client back to the pool

    // Return the data as JSON
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Database query error:', error);
    // Return an error response
    return NextResponse.json({ error: 'Failed to fetch jobs data' }, { status: 500 });
  }
}