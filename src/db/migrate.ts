import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from '.';

// This will automatically run needed migrations on the database
async function main() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error performing migrations:', err);
  process.exit(1);
}); 