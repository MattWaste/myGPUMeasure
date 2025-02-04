import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGPUs } from '../api/gpuAPI';

interface ElectricityPrice {
  state: string;
  price: string; // e.g. "10.91" in dollars
  period: string; // in "YYYY-MM" format
}

interface InternationalElectricityPrice {
  country: string;
  price: string; // e.g. "0.001" in dollars
  period: string;
}

export default function PowerUsage() {
  // Initialize with defaults – adjust as needed.
  const [selectedState, setSelectedState] = useState<string>('CA');
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  // Query to fetch Domestic Electricity Prices (CSV)
  const { data: electricityData, isLoading: electricityLoading, error: electricityError } = useQuery<ElectricityPrice[]>({
    queryKey: ['electricityPrices'],
    queryFn: async () => {
      const res = await fetch('/data/electricity_prices.csv');
      const text = await res.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const header = lines[0].split(',').map(h => h.trim());
      const records: ElectricityPrice[] = lines.slice(1).map(line => {
        const values = line.split(',');
        const record: any = {};
        header.forEach((h, i) => {
          record[h.toLowerCase()] = values[i]?.trim();
        });
        return record;
      });
      return records;
    }
  });

  // Query to fetch International Electricity Price Data (CSV)
  const { data: internationalData, isLoading: internationalLoading, error: internationalError } = useQuery<InternationalElectricityPrice[]>({
    queryKey: ['internationalElectricityPrices'],
    queryFn: async () => {
      const res = await fetch('/data/international_power_draw_6_2024.csv');
      const text = await res.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const header = lines[0].split(',').map(h => h.trim());
      const records: InternationalElectricityPrice[] = lines.slice(1).map(line => {
        const values = line.split(',');
        const record: any = {};
        header.forEach((h, i) => {
          record[h.toLowerCase()] = values[i]?.trim();
        });
        return record;
      });
      return records;
    }
  });

  // Query to fetch GPU data as before
  const { data: gpuData, isLoading: gpuLoading, error: gpuError } = useQuery({
    queryKey: ['gpus'],
    queryFn: fetchGPUs
  });

  if (electricityLoading || internationalLoading || gpuLoading)
    return <div>Loading...</div>;
  if (electricityError || internationalError || gpuError)
    return <div>Error loading data.</div>;
  if (!electricityData || !internationalData || !gpuData)
    return <div>No data available</div>;

  // Determine the effective electricity price.
  let effectivePrice = 0;
  let regionLabel = '';

  const domesticRecord = electricityData.find(item => item.state === selectedState);
  const internationalRecord = internationalData.find(item => item.country === selectedCountry);

  if (internationalRecord) {
    const parsedPrice = parseFloat(internationalRecord.price.trim());
    effectivePrice = !isNaN(parsedPrice) ? parsedPrice : 0;
    regionLabel = internationalRecord.country;
  } else if (domesticRecord) {
    const parsedPrice = parseFloat(domesticRecord.price.trim()) / 100;    effectivePrice = !isNaN(parsedPrice) ? parsedPrice : 0;
    regionLabel = domesticRecord.state;
  }

  // Format the price display value consistently with 4 decimals.
  const formattedPrice = effectivePrice.toFixed(4);

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Power Usage</h1>

      {/* Domestic Electricity Prices Section */}
      <section className="mb-6">
        <h2 className="mb-2 text-xl font-bold">Domestic Electricity Prices (by State)</h2>
        <ul>
          {electricityData.map(item => (
            <li
              key={item.state}
              onClick={() => {
                setSelectedState(item.state);
                // Clear any international selection
                setSelectedCountry('');
              }}
              className={`cursor-pointer ${selectedState === item.state && !selectedCountry ? 'font-bold' : ''}`}
            >
              {item.state}: ${(parseFloat(item.price.trim())/100).toFixed(3)} per kWh (Period: {item.period})
            </li>
          ))}
        </ul>
      </section>

      {/* International Electricity Prices Section */}
      <section className="mb-6">
        <h2 className="mb-2 text-xl font-bold">International Electricity Prices (by Country)</h2>
        <ul>
          {internationalData.map(item => (
            <li
              key={item.country}
              onClick={() => {
                setSelectedCountry(item.country);
                // Clear domestic selection if using country data
                setSelectedState('');
              }}
              className={`cursor-pointer ${selectedCountry === item.country ? 'font-bold' : ''}`}
            >
              {item.country}: ${parseFloat(item.price.trim()).toFixed(3)} per kWh (Period: {item.period})
            </li>
          ))}
        </ul>
      </section>

      {/* GPU Data Section */}
      <section>
        <h2 className="mb-2 text-xl font-bold">GPU Power Costs in {regionLabel}</h2>
        <ul className="space-y-2">
          {gpuData.map((gpu: any) => {
            const dailyCost = (gpu.tdp / 1000) * 10 * effectivePrice;
            const kiloWattUse = (gpu.tdp/1000)
            const monthlyCost = (gpu.tdp / 1000) * 10 * 30 * effectivePrice;
            const annualCost = (gpu.tdp / 1000) * 10 * 365 * effectivePrice;
            const annualCarbonCost = (gpu.tdp / 1000 * .867) * 10 * 365;
            return (
              <li key={gpu.id} className="p-2 border rounded">
                <div>{gpu.manufacturer} {gpu.name}</div>
                <div className="text-sm text-gray-600">
                  Kilowatts: {kiloWattUse} <br/> 
                  Power Draw: {gpu.tdp}W<br/>
                  Daily Cost: ${dailyCost.toFixed(2)}<br />
                  Monthly Cost: ${monthlyCost.toFixed(2)}<br />
                  Annual Cost : ${annualCost.toFixed(2)}<br/>
                  {!selectedCountry ? (
                  <div>
                    Annual Carbon Cost : {annualCarbonCost.toFixed(2)} lb CO₂/kWh
                  </div>
                  ) : (
            <div>
              Annual Carbon Cost : not enough data
            </div>
  )}
                </div>
              </li>
              // 823.1 lbs CO2/MWh × 1 metric ton/2,204.6 lbs × 1/(1-0.051) MWh delivered/MWh generated × 1 MWh/1,000 kWh = 3.94 × 10-4 metric tons CO2/kWh
              // 0823.1 lbs CO2/kWh × 1 metric ton/2,204.6 lbs × 1/(1-0.051) MWh delivered/MWh generated × 1 MWh/1,000 kWh = 3.94 × 10-4 metric tons CO2/kWh
            );
          })}
        </ul>
        <div className="mt-4">
          Using electricity price: ${formattedPrice} per kWh
        </div>
      </section>
    </div>
  );
}