// src/components/PowerUsage.tsx
import { useQuery } from '@tanstack/react-query';
import { fetchElectricityData } from '../api/eiaApi';

export default function PowerUsage() {
  // Format dates properly for the API
  const endDate = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
  const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 7); // Format: YYYY-MM

  const { data, isLoading, error } = useQuery({
    queryKey: ['electricityData', startDate, endDate],
    queryFn: () => fetchElectricityData(startDate, endDate)
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div>
      <h1>Monthly Power Usage</h1>
      {/* Render your data */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}