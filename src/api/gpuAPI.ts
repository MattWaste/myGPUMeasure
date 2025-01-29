interface GPU {
    id: number;
    manufacturer: string;
    name: string;
    tdp: number;
  }
  
  export async function fetchGPUs(): Promise<GPU[]> {
    const response = await fetch('http://localhost:3000/api/gpus');
    if (!response.ok) {
      throw new Error('Failed to fetch GPU data');
    }
    return response.json();
  }