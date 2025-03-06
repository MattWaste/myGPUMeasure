import path from 'path';
import express from 'express';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './db/schema';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from .env
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const app = express();
app.use(cors());

// Handle paths differently based on how the file is executed
const isProd = process.env.NODE_ENV === 'production';

// Determine paths for static files and index.html
let staticPath;
let indexPath;

if (isProd) {
  // In production, we're running compiled code in dist/server
  // Static files are in dist/ (one level up)
  staticPath = path.resolve(process.cwd(), 'dist');
  indexPath = path.resolve(process.cwd(), 'dist/index.html');
} else {
  // In development
  staticPath = path.resolve(process.cwd(), 'dist');
  indexPath = path.resolve(process.cwd(), 'dist/index.html');
}

// Serve static files
console.log(`Serving static files from: ${staticPath}`);
app.use(express.static(staticPath));

// Configure PostgreSQL connection
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
  console.log(`Serving SPA from: ${indexPath}`);
  res.sendFile(indexPath);
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