import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGPUs } from '../api/gpuAPI';

interface ElectricityPrice {
  state: string;
  price: string; // as stored in CSV, e.g. "10.91"
  period: string; // in "YYYY-MM" format
}

export default function PowerUsage() {
  const [selectedState, setSelectedState] = useState<string>('CA');

  // Query to fetch the parsed CSV data for electricity prices
  const { data: electricityData, isLoading: electricityLoading, error: electricityError } = useQuery<ElectricityPrice[]>({
    queryKey: ['electricityPrices'],
    queryFn: async () => {
      const res = await fetch('/data/electricity_prices.csv');
      const text = await res.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const header = lines[0].split(',').map(h => h.trim());
      // Parse each row into an ElectricityPrice object
      const records: ElectricityPrice[] = lines.slice(1).map(line => {
        const values = line.split(',');
        const record: any = {};
        header.forEach((h, i) => {
          record[h] = values[i]?.trim();
        });
        return record;
      });
      return records;
    }
  });

  const { data: gpuData, isLoading: gpuLoading, error: gpuError } = useQuery({
    queryKey: ['gpus'],
    queryFn: fetchGPUs
  });

  if (electricityLoading || gpuLoading) return <div>Loading...</div>;
  if (electricityError || gpuError) return <div>Error loading data.</div>;
  if (!electricityData || !gpuData) return <div>No data available</div>;

  // Use the electricity CSV data (which you have filtered to only include the latest period per state)
  const result = electricityData.map(item => ({
    state: item.state,
    price: `$${item.price} per kWh`,
    period: item.period
  }));

  const selectedStatePrice = result.find(item => item.state === selectedState)?.price;
  const priceNumber = selectedStatePrice ? parseFloat(selectedStatePrice.replace('$', '').split(' ')[0]) : 0;

  const gpuPowerCosts = gpuData.map((gpu: any) => ({
    gpu,
    state: selectedState,
    dailyCost: (gpu.tdp / 1000) * 24 * priceNumber,
    monthlyCost: (gpu.tdp / 1000) * 24 * 30 * priceNumber
  }));

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Most Recent Residential Price per State</h1>
      <ul className="mb-8">
        {result.map((item) => (
          <li 
            key={item.state}
            className={`cursor-pointer ${selectedState === item.state ? 'font-bold' : ''}`}
            onClick={() => setSelectedState(item.state)}
          >
            {item.state}: {item.price} (as of {item.period})
          </li>
        ))}
      </ul>

      <h2 className="mb-4 text-xl font-bold">GPU Power Costs in {selectedState}</h2>
      <ul className="space-y-2">
        {gpuPowerCosts.map(({ gpu, dailyCost, monthlyCost }: any) => (
          <li key={gpu.id} className="p-2 border rounded">
            <div>{gpu.manufacturer} {gpu.name}</div>
            <div className="text-sm text-gray-600">
              Power Draw: {gpu.tdp}W
              <br />
              Daily Cost: ${dailyCost.toFixed(2)}
              <br />
              Monthly Cost: ${monthlyCost.toFixed(2)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}