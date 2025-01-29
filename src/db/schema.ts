import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

export const gpus = pgTable('gpus', {
  id: serial('id').primaryKey(),
  manufacturer: text('manufacturer').notNull(),
  name: text('name').notNull(),
  tdp: integer('tdp')
});
