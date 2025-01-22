if (!import.meta.env.VITE_EIA_API_KEY) {
  throw new Error('VITE_EIA_API_KEY is not defined in environment variables');
}

interface EIAQueryParams {
  frequency?: 'monthly' | 'annual'
  data?: string[]
  start?: string
  end?: string
  offset?: number
  length?: number
  sectorid?: string[]
}

const API_KEY = import.meta.env.VITE_EIA_API_KEY;
const EIA_BASE_URL = 'https://api.eia.gov/v2';

export const fetchEIAData = async (endpoint: string = 'electricity/retail-sales/data', params: EIAQueryParams = {}): Promise<any> => {
    // Start with required parameters
    const queryParams = new URLSearchParams({
        'api_key': API_KEY,
    });

    // Add optional parameters only if they are provided
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
    console.log('Requesting URL:', url); // For debugging

    const response = await fetch(url);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText); // For debugging
        throw new Error(`EIA API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
};

export const fetchElectricityData = async (startDate: string, endDate: string) => {
    return fetchEIAData('electricity/retail-sales/data', {
        frequency: 'monthly',
        data: ['price'],
        start: startDate,
        end: endDate
    });
};



