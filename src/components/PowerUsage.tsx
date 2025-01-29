import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchElectricityData } from '../api/eiaAPI';
import { fetchGPUs } from '../api/gpuAPI';

interface GPU {
  id: number;
  manufacturer: string;
  name: string;
  tdp: number;
}


export default function PowerUsage() {
  const [selectedState, setSelectedState] = useState<string>('CA');

  const endDate = new Date().toISOString().slice(0, 7);
  const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 7);

  const { data: electricityData, isLoading: electricityLoading } = useQuery({
    queryKey: ['electricityData', startDate, endDate],
    queryFn: () => fetchElectricityData(startDate, endDate),
    retry: 3,
    staleTime: 1000 * 60 * 5
  });

  const { data: gpuData, isLoading: gpuLoading, error: gpuError } = useQuery<GPU[]>({
    queryKey: ['gpus'],
    queryFn: fetchGPUs
  });

  if (electricityLoading || gpuLoading) return <div>Loading...</div>;
  if (gpuError) return <div>Error: {gpuError.message}</div>;
  if (!electricityData || !gpuData) return <div>No data available</div>;

  const mostRecentPerState = electricityData.response.data
    .filter((item: any) => item.sectorid === 'RES' && item.stateid.length === 2)
    .reduce((acc: Record<string, any>, item: any) => {
      const state = item.stateid;
      const currentDate = new Date(item.period);
      if (!acc[state] || currentDate > new Date(acc[state].period)) {
        acc[state] = item;
      }
      return acc;
    }, {});

  const result = Object.values(mostRecentPerState).map((item: any) => ({
    state: item.stateid,
    price: `$${item.price} per kWh`,
    period: item.period
  }));

  const selectedStatePrice = result.find(item => item.state === selectedState)?.price;
  const priceNumber = selectedStatePrice ? parseFloat(selectedStatePrice.replace('$', '').split(' ')[0]) : 0;

  const gpuPowerCosts = gpuData.map(gpu => ({
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
        {gpuPowerCosts.map(({ gpu, dailyCost, monthlyCost }) => (
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