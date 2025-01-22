import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const client = createClient({
  url: process.env.GPU_DB ?? 'file:gpu_db.db',
});

export const db = drizzle(client, { schema }); 