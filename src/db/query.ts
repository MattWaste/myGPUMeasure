import { db } from '../index';
import { gpus } from './schema';

export async function queryGPUs() {
  const allGPUs = await db.select().from(gpus);
  console.log('All GPUs in database:');
  console.table(allGPUs);
  return allGPUs
}

// Remove the following line to prevent immediate execution
// queryGPUs().catch(console.error);@