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

interface PowerUsageProps {
  selectedGPUCompany: string;
  onCompanyChange: (company: string) => void;
}

export default function PowerUsage({ selectedGPUCompany, onCompanyChange }: PowerUsageProps) {
  // Existing state variables
  const [gpuDailyUseage, setGpuDailyUseage] = useState<number>(10);
  const [gpuWorkload, setGpuWorkload] = useState<number>(0.7);
  const [selectedState, setSelectedState] = useState<string>('CA');
  const [selectedCountry, setSelectedCountry] = useState<string>('USA');
  const [showSources, setShowSources] = useState<boolean>(false);


  // Remove local state for GPU company and model
  const [selectedGPUModel, setSelectedGPUModel] = useState<string>('');

  // Set text size for GPU details based on whether a specific GPU model is selected

  // Query to fetch Domestic Electricity Prices (CSV)
  const { data: electricityData, isLoading: electricityLoading, error: electricityError } = useQuery<ElectricityPrice[]>({
    queryKey: ['electricityPrices'],
    queryFn: async () => {
      const res = await fetch('/electricity_prices.csv');
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
      const res = await fetch('/international_power_draw_6_2024.csv');
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

  // Update the currentRecord and effectivePrice logic:
  const currentRecord = selectedCountry !== 'USA'
  ? internationalData.find((item: InternationalElectricityPrice) => item.country === selectedCountry)
  : electricityData.find((item: ElectricityPrice) => item.state === selectedState);

  const effectivePrice = currentRecord
    ? selectedCountry !== 'USA'
      ? parseFloat(currentRecord.price.trim())
      : parseFloat(currentRecord.price.trim()) / 100
    : 0;

  // For display of the selected electricity price, show dollars with 4 decimals.
  const formattedPrice = effectivePrice.toFixed(4);

  // Derive distinct dropdown options:
  // GPU Company options from gpuData manufacturer property
  const gpuCompanies: string[] = [
    ...new Set<string>(gpuData.map((gpu: any) => String(gpu.manufacturer)))
  ].sort((a: string, b: string) => a.localeCompare(b));
  
  
  
  const filteredGPUModels = selectedGPUCompany
    ? gpuData.filter((gpu: any) => gpu.manufacturer === selectedGPUCompany)
    : gpuData;
  const gpuModels: string[] = Array.from(new Set(filteredGPUModels.map((gpu: any) => String(gpu.name))));
  
  const stateOptions: string[] = Array.from(
    new Set((electricityData as ElectricityPrice[]).map(item => String(item.state)))
  ).sort((a, b) => a.localeCompare(b));
  
  const countryOptions: string[] = Array.from(new Set(internationalData.map((item: InternationalElectricityPrice) => item.country)));

  

  // Build location label: if country is USA then include state, otherwise, just the country.
  const locationLabel = selectedCountry === 'USA' && selectedState 
    ? `${selectedCountry}, ${selectedState}` 
    : selectedCountry || selectedState;

  return (
    <div className="container p-4 mx-auto dark:text-gray-100">
      <h2 className="mb-4 text-3xl text-center dark:text-white">
        Configure Your Setup
      </h2>
      {/* Inline Sentence Filters Section */}
      <section className="p-4 mb-6 border dark:border-gray-700">
        <div className="flex flex-col space-y-2 text-left">
          <div className="flex flex-col">
            <span className='text-xl'>Make:</span>
            <select
              value={selectedGPUCompany}
              onChange={(e) => {
                onCompanyChange(e.target.value);
                setSelectedGPUModel("");
              }}
              className="px-2 py-1 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
            >
              {gpuCompanies.map((company: string) => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <span className='text-xl'>Model:</span>
            <select
              value={selectedGPUModel}
              onChange={(e) => setSelectedGPUModel(e.target.value)}
              disabled={!selectedGPUCompany}
              className="px-2 py-1 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
            >
              <option value="">Select Model</option>
              {gpuModels.map((model: string) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <span className='text-xl'>Usage (daily hrs):</span>
            <select
              value={gpuDailyUseage}
              onChange={(e) => setGpuDailyUseage(Number(e.target.value))}
              className="px-2 py-1 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
            >
              <option value={1}>1 hr</option>
              <option value={2}>2 hrs</option>
              <option value={3}>3 hrs</option>
              <option value={4}>4 hrs</option>
              <option value={5}>5 hrs</option>
              <option value={6}>6 hrs</option>
              <option value={7}>7 hrs</option>
              <option value={8}>8 hrs</option>
              <option value={9}>9 hrs</option>
              <option value={10}>10 hrs</option>
              <option value={11}>11 hrs</option>
              <option value={12}>12 hrs</option>
              <option value={13}>13 hrs</option>
              <option value={14}>14 hrs</option>
              <option value={15}>15 hrs</option>
              <option value={16}>16 hrs</option>
              <option value={17}>17 hrs</option>
              <option value={18}>18 hrs</option>
              <option value={19}>19 hrs</option>
              <option value={20}>20 hrs</option>
              <option value={21}>21 hrs</option>
              <option value={22}>22 hrs</option>
              <option value={23}>23 hrs</option>
              <option value={24}>24 hrs</option>
            </select>
          </div>
          <div className="flex flex-col">
            <span className='text-xl'>Load:</span>
            <select
              value={gpuWorkload}
              onChange={(e) => setGpuWorkload(Number(e.target.value))}
              className="px-2 py-1 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
            >
              <option value={0.15}>Light* (.15)  </option>
              <option value={0.6}>Medium* (.6)</option>
              <option value={1}>Heavy* (1)</option>
            </select>
          </div>
          <div className="flex flex-col">
            <span className='text-xl'>Country:</span>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedState("");
              }}
              className="px-2 py-1 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
            >
              <option value="USA">USA</option>
              {countryOptions
                .filter((country) => country !== "USA")
                .map((country: string) => (
                  <option key={country} value={country}>{country}</option>
                ))}
            </select>
          </div>
          <div className="flex flex-col">
            <span className='text-xl'>State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-2 py-1 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
            >
              <option value="">Select State</option>
              {stateOptions.map((state: string) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* GPU Data Section */}
      <section>
        <h2 className="mb-2 text-2xl text-center dark:text-white">
          GPU Power Costs in {locationLabel}
        </h2>
        <ul className="space-y-2 text-1.5"> 
          {gpuData
            .filter((gpu: any) => !selectedGPUCompany || gpu.manufacturer === selectedGPUCompany)
            .filter((gpu: any) => !selectedGPUModel || gpu.name === selectedGPUModel)
            .map((gpu: any) => {
              const dailyCost = (gpu.tdp / 1000 * gpuWorkload) * gpuDailyUseage * effectivePrice;
              const monthlyCost = (gpu.tdp / 1000 * gpuWorkload) * gpuDailyUseage * 30 * effectivePrice;
              const annualCost = (gpu.tdp / 1000 * gpuWorkload) * gpuDailyUseage * 365 * effectivePrice;
              const annualCarbonCost = (gpu.tdp / 1000 * gpuWorkload) * gpuDailyUseage * 0.867 * 365;
              return (
                <li key={gpu.id} className={`p-2 border-4 rounded dark:border-gray-700 ${selectedGPUModel ? 'shadow-md' : ''}`}>
                  <div className={`${selectedGPUModel ? 'text-xl mb-2' : 'text-lg'} pt-2 dark:text-white`}>
                    {gpu.manufacturer} {gpu.name}
                  </div>
                  
                  {selectedGPUModel ? (
                    <div className="flex flex-col p-4 space-y-3 text-lg text-gray-600 dark:text-white">
                      <div className="flex justify-between pb-2 border-b border-gray-300 dark:border-gray-700">
                        <span>Power Draw:</span> <span>{gpu.tdp}W</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-gray-300 dark:border-gray-700">
                        <span>Daily Cost:</span> <span className="">${dailyCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-gray-300 dark:border-gray-700">
                        <span>Monthly Cost:</span> <span className="">${monthlyCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-gray-300 dark:border-gray-700">
                        <span>Annual Cost:</span> <span className="text-lg ">${annualCost.toFixed(2)}</span>
                      </div>
                      {selectedCountry === 'USA' ? (
                        <div className="flex justify-between pt-1">
                          <span>Annual Carbon Cost:</span> 
                          <span className="">{annualCarbonCost.toFixed(2)} lbs of CO₂</span>
                        </div>
                      ) : (
                        <div className="flex justify-between pt-1">
                          <span>Annual Carbon Cost:</span>
                          <span className="italic">not enough data</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Simple format for multiple GPU listing
                    <div className="text-sm text-gray-600 dark:text-white">
                      <span>Power Draw</span>: {gpu.tdp}W<br />
                      Daily Cost: ${dailyCost.toFixed(2)}<br />
                      Monthly Cost: ${monthlyCost.toFixed(2)}<br />
                      Annual Cost: ${annualCost.toFixed(2)}<br />
                      {selectedCountry === 'USA' ? (
                        <div>
                          Annual Carbon Cost: {annualCarbonCost.toFixed(2)} lbs of CO₂
                        </div>
                      ) : (
                        <div>
                          Annual Carbon Cost: not enough data
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
        <div className="mt-4 text-center dark:text-white">
          Using electricity price: ${formattedPrice} per kWh
        </div>
        <div className="text-center dark:text-white">
        Pricing last Updated: {currentRecord ? currentRecord.period : "N/A"}
        </div>
        <br></br>
    
        <button
  onClick={() => setShowSources(prev => !prev)}
  className="block px-2 py-1 mx-auto mb-2 border rounded dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
>
  {showSources ? "Hide Details" : "Show Details"}
</button>
{showSources && (
<>
<br></br>
<div className="italic text-center underline dark:text-white"> Load </div>
<div className="italic text-center dark:text-white">
<br></br>
*Light = streaming, browsing, word processing  etc.<br></br>
*Medium = gaming, light rendering, light editing etc.<br></br>
*Heavy = AAA gaming, AI training, 3D, crypto mining etc.<br></br>
<br></br>
</div>

  <div className="italic text-center underline dark:text-white"> Sources</div><br></br>
  <div className="italic text-center break-words dark:text-white">
    U.S. Energy Information Administration, Form EIA-861M, 'Monthly Electric Sales and Revenue With State Distributions Report.'
    U.S. Energy Information Administration, Form EIA-923, 'Power Plant Operations Report.'
    <br></br>
    <br></br>
    EPA (2024). eGRID. Table 1: Subregion Output Emission Rates (eGRID2022), year 2022 data. U.S. Environmental Protection Agency, Washington, DC.
    <br></br>
    <br></br>
    GlobalPetrolPrices.com. "Electricity Prices." GlobalPetrolPrices.com, 2025, https://www.globalpetrolprices.com/electricity_prices/.
  </div>
  </> )}
      </section>
    </div>
  );
}