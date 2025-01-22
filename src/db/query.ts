import { db } from '../index';
import { gpus } from './schema';

async function queryGPUs() {
  const allGPUs = await db.select().from(gpus);
  console.log('All GPUs in database:');
  console.table(allGPUs);
}

queryGPUs().catch(console.error); 