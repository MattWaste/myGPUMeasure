import fs from 'fs/promises';
import path from 'path';
import { stringify } from 'csv-stringify/sync';
import dotenv from 'dotenv';
import { fetchEIAData } from '../src/api/eiaAPI';

// Load environment variables
dotenv.config();

// Verify API key exists
if (!process.env.VITE_EIA_API_KEY) {
  throw new Error('VITE_EIA_API_KEY is not defined in environment variables');
}

export async function fetchAndSaveElectricityPrices() {
  try {
    const response = await fetchEIAData('electricity/retail-sales/data', {
      frequency: 'monthly',
      data: ['price'],
      sectorid: ['RES']
    });

    // Filter records to only those with a valid 2-letter state ID
    const filteredRecords = response.response.data.filter((item: any) => item.stateid.length === 2);

    // Reduce records to keep only the most recent period per state.
    const latestMap = filteredRecords.reduce((acc: Record<string, any>, item: any) => {
      const state = item.stateid;
      const itemDate = new Date(item.period + '-01');
      
      if (!acc[state]) {
        acc[state] = item;
      } else {
        const currentDate = new Date(acc[state].period + '-01');
        if (itemDate > currentDate) {
          acc[state] = item;
        }
      }
      
      return acc;
    }, {});

    const prices = Object.values(latestMap).map((item: any) => ({
      state: item.stateid,
      price: item.price,
      period: item.period
    }));

    const csvPath = path.join(process.cwd(), 'data', 'electricity_prices.csv');
    await fs.writeFile(csvPath, stringify(prices, { header: true }));

    console.log('Electricity prices updated with the latest period per state:', new Date().toISOString());
  } catch (error) {
    console.error('Failed to update electricity prices:', error);
    process.exit(1);
  }
}

fetchAndSaveElectricityPrices();