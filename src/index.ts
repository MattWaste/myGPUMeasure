import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { schema } from './db/schema';
const client = createClient({
  url: process.env.GPU_DB ?? 'file:gpu_db.db',
});
export const db = drizzle(client, { schema });