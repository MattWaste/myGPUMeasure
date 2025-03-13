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
    console.log('Fetching latest electricity prices...');
    
    // Get the current date and calculate a date 18 months ago to limit query
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 18);
    const startDateString = startDate.toISOString().split('T')[0].substring(0, 7); // Format as YYYY-MM
    
    //get the latest available period
    const latestResponse = await fetchEIAData('electricity/retail-sales/data', {
      frequency: 'monthly',
      data: ['price'],
      sectorid: ['RES'],
      // Sort by period (newest first) and get just one record
      sort: 'period',
      direction: 'desc',
      length: 1
    });
    
    // Extract the latest period
    const latestPeriod = latestResponse.response?.data?.[0]?.period;
    console.log(`Latest available period: ${latestPeriod}`);
    
    // fetch all data from recent months
    const response = await fetchEIAData('electricity/retail-sales/data', {
      frequency: 'monthly',
      data: ['price'],
      sectorid: ['RES'],
      start: startDateString,
      sort: 'period',
      direction: 'desc',
      length: 1000  
    });

    if (!response.response || !response.response.data || !Array.isArray(response.response.data)) {
      throw new Error('Invalid response format from EIA API');
    }
    
    console.log(`Received ${response.response.data.length} records from EIA API`);

    // Filter to 2-letter state ID
    const filteredRecords = response.response.data.filter((item: any) => item.stateid.length === 2);
    console.log(`Found ${filteredRecords.length} records with valid state IDs`);

    // Reduce to most recent period per state
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

    console.log(`Processed latest prices for ${prices.length} states`);
    
    // Make sure the data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    const csvPath = path.join(dataDir, 'electricity_prices.csv');
    await fs.writeFile(csvPath, stringify(prices, { header: true }));

    // Also copy to public directory for immediate use
    const publicPath = path.join(process.cwd(), 'public', 'electricity_prices.csv');
    await fs.writeFile(publicPath, stringify(prices, { header: true }));

    console.log('Electricity prices updated with the latest period per state:', new Date().toISOString());
    console.log(`CSV files saved to ${csvPath} and ${publicPath}`);
  } catch (error) {
    console.error('Failed to update electricity prices:', error);
    process.exit(1);
  }
}

// Self-execute when run directly
if (require.main === module) {
  fetchAndSaveElectricityPrices();
}