import { sqliteTable, text, integer,} from 'drizzle-orm/sqlite-core';

export const gpus = sqliteTable('gpus', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  manufacturer: text('manufacturer').notNull(),
  name: text('name').notNull(),
  tdp: integer('tdp'), // in watts  
});

export const schema = { gpus };