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

  // Process data to get the most recent residential price for each state
  const mostRecentPerState = data.response.data
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

  return (
    <div>
      <h1>Most Recent Residential Price per State</h1>
      <ul>
        {result.map((item) => (
          <li key={item.state}>
            {item.state}: {item.price} (as of {item.period})
          </li>
        ))}
      </ul>
    </div>
  );
}