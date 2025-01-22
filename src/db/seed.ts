import { db } from '../index';
import { gpus } from './schema';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { finished } from 'stream/promises';
import { existsSync } from 'fs';

async function readCSV(filePath: string) {
  const records: any[] = [];
  let skippedRecords = 0;
  
  // Better file existence check
  if (!existsSync(filePath)) {
    throw new Error(`CSV file not found at: ${filePath}`);
  }

  const parser = createReadStream(filePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
  );

  // Add error handler for the parser
  parser.on('error', (error) => {
    console.error('Error parsing CSV:', error.message);
  });

  parser.on('readable', function() {
    let record;
    while ((record = parser.read()) !== null) {
      // Map CSV columns to our schema fields using the correct column names
      const cleanedRecord = {
        manufacturer: record['Manufacturer']?.trim(),
        name: record['Card Name']?.trim(),
        tdp: record['TDP'] ? parseInt(record['TDP']) : null
      };
      
      // Debug logging
      console.log('Processing record:', {
        original: record,
        cleaned: cleanedRecord
      });
      
      if (cleanedRecord.manufacturer && cleanedRecord.name && cleanedRecord.tdp) {
        records.push(cleanedRecord);
      } else {
        skippedRecords++;
        console.log('Skipped invalid record:', record);
      }
    }
  });

  await finished(parser);
  console.log(`Processed ${records.length} valid records`);
  console.log(`Skipped ${skippedRecords} invalid records`);
  return records;
}

async function seed() {
  console.log('Seeding database...');

  try {
    // First clear existing data
    await db.delete(gpus);

    // Updated filename to use underscores instead of spaces
    const gpuData = await readCSV('./data/GPU_power_draw_sql.csv');
    
    // Insert GPU data
    await db.insert(gpus).values(gpuData);

    console.log(`Seeding complete! Inserted ${gpuData.length} GPUs`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seed().catch((err) => {
  console.error(err);
  process.exit(1);
}); 