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
  // Existing state variables
  const [gpuDailyUseage, setGpuDailyUseage] = useState<number>(10);
  const [gpuWorkload, setGpuWorkload] = useState<number>(0.7);
  const [selectedState, setSelectedState] = useState<string>('CA');
  const [selectedCountry, setSelectedCountry] = useState<string>('USA');
  
  // New filter states for GPU Company and Model
  const [selectedGPUCompany, setSelectedGPUCompany] = useState<string>('Nvidia');
  const [selectedGPUModel, setSelectedGPUModel] = useState<string>('');

  // Query to fetch Domestic Electricity Prices (CSV)
  const { data: electricityData, isLoading: electricityLoading, error: electricityError } = useQuery<ElectricityPrice[]>({
    queryKey: ['electricityPrices'],
    queryFn: async () => {
      const res = await fetch('/data/electricity_prices.csv');
      const text = await res.text();
      const lines = text.split('\n').filter(line => line.trim());
      const header = lines[0].split(',').map(h => h.trim());
      return lines.slice(1).map(line => {
        const values = line.split(',');
        const record: any = {};
        header.forEach((h, i) => (record[h.toLowerCase()] = values[i]?.trim()));
        return record;
      });
    }
  });

  // Query to fetch International Electricity Price Data (CSV)
  const { data: internationalData, isLoading: internationalLoading, error: internationalError } = useQuery<InternationalElectricityPrice[]>({
    queryKey: ['internationalElectricityPrices'],
    queryFn: async () => {
      const res = await fetch('/data/international_power_draw_6_2024.csv');
      const text = await res.text();
      const lines = text.split('\n').filter(line => line.trim());
      const header = lines[0].split(',').map(h => h.trim());
      return lines.slice(1).map(line => {
        const values = line.split(',');
        const record: any = {};
        header.forEach((h, i) => (record[h.toLowerCase()] = values[i]?.trim()));
        return record;
      });
    }
  });

  // Query to fetch GPU data
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

  // Derive the current electricity record based on selection (international if chosen, else domestic)
  const currentRecord = selectedCountry
    ? internationalData.find(item => item.country === selectedCountry)
    : electricityData.find(item => item.state === selectedState);
  // When using domestic data, shift the decimal two places (i.e. divide the dollar value by 100)
  const effectivePrice = currentRecord
    ? selectedCountry
      ? parseFloat(currentRecord.price.trim())
      : parseFloat(currentRecord.price.trim()) / 100
    : 0;
  // For display of the selected electricity price, show dollars with 4 decimals.
  const formattedPrice = effectivePrice.toFixed(4);

  // Derive distinct dropdown options:
  // GPU Company options from gpuData manufacturer property
  const gpuCompanies = Array.from(new Set(gpuData.map((gpu: any) => gpu.manufacturer)));
  // GPU Model options filtered by selected company.
  const filteredGPUModels = selectedGPUCompany
    ? gpuData.filter((gpu: any) => gpu.manufacturer === selectedGPUCompany)
    : gpuData;
  const gpuModels = Array.from(new Set(filteredGPUModels.map((gpu: any) => gpu.name)));
  // State options from domestic electricityData
  const stateOptions = Array.from(new Set(electricityData.map(item => item.state)));
  // Country options from internationalData
  const countryOptions = Array.from(new Set(internationalData.map(item => item.country)));

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Power Usage</h1>

      {/* Filters Section */}
      <section className="p-4 mb-6 border">
        <h2 className="mb-2 text-xl font-bold">Filters</h2>

        <div className="mb-2">
          <label className="mr-2">GPU Company: </label>
          <select
            value={selectedGPUCompany}
            onChange={(e) => {
              setSelectedGPUCompany(e.target.value);
              setSelectedGPUModel("");
            }}
          >
            <option value="">Select Company</option>
            {gpuCompanies.map((company) => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="mr-2">GPU Model: </label>
          <select
            value={selectedGPUModel}
            onChange={(e) => setSelectedGPUModel(e.target.value)}
            disabled={!selectedGPUCompany}
          >
            <option value="">Select Model</option>
            {gpuModels.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="mr-2">Daily Usage (hrs): </label>
          <select
            value={gpuDailyUseage}
            onChange={(e) => setGpuDailyUseage(Number(e.target.value))}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
            <option value={9}>9</option>
            <option value={10}>10</option>
            <option value={11}>11</option>
            <option value={12}>12</option>
            <option value={13}>13</option>
            <option value={14}>14</option>
            <option value={15}>15</option>
            <option value={16}>16</option>
            <option value={17}>17</option>
            <option value={18}>18</option>
            <option value={19}>19</option>
            <option value={20}>20</option>
            <option value={20}>21</option>
            <option value={22}>22</option>
            <option value={23}>23</option>
            <option value={24}>24</option>
          
          </select>
        </div>

        <div className="mb-2">
          <label className="mr-2">GPU Workload: </label>
          <select
            value={gpuWorkload}
            onChange={(e) => setGpuWorkload(Number(e.target.value))}
          >
            <option value={0.15}>Light (.15— web browsing, streaming video, basic ui rendering)</option>
            <option value={0.6}>Medium (.6- casual gaming, light video editing, etc.)</option>
            <option value={1}>Heavy (1— ai training, gaming, 3d rendering,etc.)</option>
          </select>
        </div>

        <div className="mb-2">
          <label className="mr-2">Country: </label>
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSelectedState("");
            }}
          >
            {/* Render USA first */}
            <option value="USA">USA</option>
            {countryOptions
              .filter((country) => country !== "USA")
              .map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="mr-2">State: </label>
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCountry("");
            }}
          >
            <option value="">Select State</option>
            {stateOptions.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </section>

      {/* GPU Data Section */}
      <section>
        <h2 className="mb-2 text-xl font-bold">
          GPU Power Costs in {selectedCountry || selectedState}
        </h2>
        <ul className="space-y-2">
          {gpuData
            .filter((gpu: any) => !selectedGPUCompany || gpu.manufacturer === selectedGPUCompany)
            .filter((gpu: any) => !selectedGPUModel || gpu.name === selectedGPUModel)
            .map((gpu: any) => {
              const dailyCost = (gpu.tdp / 1000 * gpuWorkload) * gpuDailyUseage * effectivePrice;
              const kiloWattUse = (gpu.tdp / 1000 * gpuWorkload);
              const monthlyCost = (gpu.tdp / 1000 * gpuWorkload) * gpuDailyUseage * 30 * effectivePrice;
              const annualCost = (gpu.tdp / 1000 * gpuWorkload) * gpuDailyUseage * 365 * effectivePrice;
              const annualCarbonCost = (gpu.tdp / 1000 * gpuWorkload) * gpuDailyUseage * 0.867 * 365;
              return (
                <li key={gpu.id} className="p-2 border rounded">
                  <div>{gpu.manufacturer} {gpu.name}</div>
                  <div className="text-sm text-gray-600">
                    Kilowatts: {kiloWattUse.toFixed(2)} <br />
                    Power Draw: {gpu.tdp}W<br />
                    Daily Cost: ${dailyCost.toFixed(2)}<br />
                    Monthly Cost: ${monthlyCost.toFixed(2)}<br />
                    Annual Cost: ${annualCost.toFixed(2)}<br />
                    {!selectedCountry ? (
                      <div>
                        Annual Carbon Cost: {annualCarbonCost.toFixed(2)} lb CO₂/kWh
                      </div>
                    ) : (
                      <div>
                        Annual Carbon Cost: not enough data
                      </div>
                    )}
                  </div>
                </li>
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