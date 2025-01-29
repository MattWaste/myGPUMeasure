import { db } from './../index';
import { gpus } from './schema';

  export async function logGPUs() {
  try {
    const allGPUs = await db.select().from(gpus);
    console.log('All GPUs in database:');
    console.table(allGPUs);
  } catch (error) {
    console.error('Error querying GPUs:', error);
  }
}

logGPUs();