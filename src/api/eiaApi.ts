import dotenv from 'dotenv';
dotenv.config();

if (!process.env.VITE_EIA_API_KEY) {
  throw new Error('VITE_EIA_API_KEY is not defined in environment variables');
}

const API_KEY = process.env.VITE_EIA_API_KEY;
const EIA_BASE_URL = 'https://api.eia.gov/v2';

export interface EIAQueryParams {
  frequency?: 'monthly' | 'annual';
  data?: string[];
  start?: string;
  end?: string;
  offset?: number;
  length?: number;
  sectorid?: string[];
}

export const fetchEIAData = async (
  endpoint: string = 'electricity/retail-sales/data',
  params: EIAQueryParams = {}
): Promise<any> => {
  const queryParams = new URLSearchParams({
    api_key: API_KEY,
  });

  if (params.frequency) {
    queryParams.append('frequency', params.frequency);
  }

  if (params.data && params.data.length > 0) {
    params.data.forEach(d => queryParams.append('data[]', d));
  }

  if (params.start) {
    queryParams.append('start', params.start);
  }

  if (params.end) {
    queryParams.append('end', params.end);
  }

  if (params.offset !== undefined) {
    queryParams.append('offset', params.offset.toString());
  }

  if (params.length !== undefined) {
    queryParams.append('length', params.length.toString());
  }

  if (params.sectorid && params.sectorid.length > 0) {
    params.sectorid.forEach(s => queryParams.append('facets[sectorid][]', s));
  }

  const url = `${EIA_BASE_URL}/${endpoint}?${queryParams.toString()}`;
  const res = await fetch(url);
  return res.json();
};