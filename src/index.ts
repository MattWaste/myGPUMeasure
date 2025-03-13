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

// Determine paths for static files and index.html based on environment
const isProd = process.env.NODE_ENV === 'production';

// In production, running from dist/server/index.js, 
// In development, running from project root, so static files are in dist/
const projectRoot = process.cwd();
const staticPath = path.join(projectRoot, 'dist');
const indexPath = path.join(projectRoot, 'dist', 'index.html');

console.log('Environment:', isProd ? 'production' : 'development');
console.log('Project root:', projectRoot);
console.log('Serving static files from:', staticPath);
console.log('Index.html path:', indexPath);

// Serve static files
app.use(express.static(staticPath));

// Configure PostgreSQL connection.
// In production, enable SSL (with rejectUnauthorized set to false) if needed.
const useSSL = process.env.DB_SSL === 'true' || (process.env.NODE_ENV === 'production' && process.env.DB_SSL !== 'false');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
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
  console.log(`Serving SPA from: ${indexPath}`);
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end();
  });
});