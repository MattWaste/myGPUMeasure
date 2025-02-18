interface GPU {
  id: number;
  manufacturer: string;
  name: string;
  tdp: number;
}

export async function fetchGPUs(): Promise<GPU[]> {
  // Use a relative URL so that it works in production as well as locally.
  const response = await fetch('/api/gpus');
  if (!response.ok) {
    throw new Error('Failed to fetch GPU data');
  }
  return response.json();
}