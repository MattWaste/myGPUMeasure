import path from 'path';
import express from 'express';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './db/schema';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const app = express();
app.use(cors());

// Determine the current directory and serve static files from 'dist'
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist')));



// Configure PostgreSQL connection.
// In production, enable SSL (with rejectUnauthorized set to false) if needed.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test the database connection
pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

// Create a drizzle ORM instance for querying
export const db = drizzle(pool, { schema });

// API route to fetch GPUs
app.get('/api/gpus', async (_req, res) => {
  try {
    const gpus = await db.select().from(schema.gpus);
    res.json(gpus);
  } catch (error) {
    console.error('Error fetching GPUs:', error);
    res.status(500).json({ error: 'Failed to fetch GPU data' });
  }
});

// Catch-all route: serve the built client (SPA) for any other requests
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Use the PORT from environment variables if provided, fallback to 3000
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown: close the HTTP server and database pool when terminating
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end();
  });
});