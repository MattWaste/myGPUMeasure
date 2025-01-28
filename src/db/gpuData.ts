import { createClient } from '@libsql/client';

const client = createClient({
  url: '/api/db',  // This will be proxied by Vite
  authToken: 'development'
});

export async function getGPUPowerData() {
  try {
    const result = await client.execute({
      sql: 'SELECT manufacturer, card_name, tdp FROM gpu_power_readings WHERE card_name = ? LIMIT 1',
      args: ['GeForce RTX 4090']
    });
    
    console.log('Database result:', result.rows);
    
    if (!result.rows || result.rows.length === 0) {
      throw new Error('No GPU data found');
    }
    
    return {
      power_draw: result.rows[0].tdp
    };
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
} 