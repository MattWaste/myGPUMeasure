import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { avg, desc, sql } from 'drizzle-orm';
import * as schema from '../src/db/schema';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  const db = drizzle(pool, { schema });

  try {
    // Get all GPUs
    const allGpus = await db.select().from(schema.gpus);
    
    // Get highest TDP GPU
    const highestTdp = await db
      .select()
      .from(schema.gpus)
      .orderBy(desc(schema.gpus.tdp))
      .limit(1);
    
    // Get unique manufacturers
    const manufacturers = await db
      .select({ manufacturer: schema.gpus.manufacturer })
      .from(schema.gpus)
      .groupBy(schema.gpus.manufacturer);
    
    // Get average TDP
    const avgTdp = await db
      .select({ average: avg(schema.gpus.tdp) })
      .from(schema.gpus);

    console.log('Total GPUs:', allGpus.length);
    console.log('Highest TDP:', highestTdp[0].name, highestTdp[0].tdp + 'W');
    console.log('Manufacturers:', manufacturers.map(m => m.manufacturer).join(', '));
    console.log('Average TDP:', Math.round(avgTdp[0].average) + 'W');

  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await pool.end();
  }
}

testConnection();